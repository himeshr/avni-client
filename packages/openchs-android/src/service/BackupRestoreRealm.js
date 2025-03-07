import {EntityMetaData, EntitySyncStatus, IdentifierAssignment, UserInfo, Concept, MyGroups} from 'avni-models';
import FileSystem from "../model/FileSystem";
import General from "../utility/General";
import fs from 'react-native-fs';
import {unzip, zip} from 'react-native-zip-archive';
import Service from "../framework/bean/Service";
import BaseService from "../service/BaseService";
import MediaQueueService from "../service/MediaQueueService";
import {get} from '../framework/http/requests';
import SettingsService from "../service/SettingsService";
import MediaService from "./MediaService";
import _ from 'lodash';
import EntityService from "./EntityService";
import EntitySyncStatusService from "./EntitySyncStatusService";

const REALM_FILE_NAME = "default.realm";
const REALM_FILE_FULL_PATH = `${fs.DocumentDirectoryPath}/${REALM_FILE_NAME}`;

@Service("backupAndRestoreService")
export default class BackupRestoreRealmService extends BaseService {
    constructor(db, context) {
        super(db, context);
    }

    subscribeOnRestore(notify) {
        this.notify = notify;
    }

    isDatabaseEverSynced() {
        return !this.isDatabaseNeverSynced();
    }

    isDatabaseNeverSynced() {
        let entityService = this.getService(EntityService);
        let entityTypeWhichWouldHaveAtLeastOneEntityInAllImplementationsAndIsQuiteEarlyInSyncCycle = Concept;
        let anEntity = entityService.findOnly(entityTypeWhichWouldHaveAtLeastOneEntityInAllImplementationsAndIsQuiteEarlyInSyncCycle.schema.name);
        return _.isEmpty(anEntity);
    }

    backup(dumpType, cb) {
        const fileName = dumpType === MediaQueueService.DumpType.Adhoc ? `adhoc-${General.randomUUID()}.realm` : `${General.randomUUID()}.realm`;

        let destFile = `${FileSystem.getBackupDir()}/${fileName}`;
        let destZipFile = `${FileSystem.getBackupDir()}/${fileName}.zip`;
        let mediaQueueService = this.getService(MediaQueueService);
        General.logInfo("BackupRestoreRealmService", `Dest: ${destFile}`);
        this.db.writeCopyTo(destFile);
        zip(destFile, destZipFile)
            .then(() => {
                General.logDebug("BackupRestoreRealmService", "Getting upload location");
                cb(10, "backupUploading");
            })
            .then(() => mediaQueueService.getDumpUploadUrl(dumpType, `adhoc-dump-as-zip-${General.randomUUID()}`))
            .then((url) => mediaQueueService.foregroundUpload(url, destZipFile, (written, total) => {
                General.logDebug("BackupRestoreRealmService", `Upload in progress ${written}/${total}`);
                cb(10 + (97 - 10) * (written / total), "backupUploading");
            }))
            .then(() => {
                General.logDebug("BackupRestoreRealmService", "Removing database backup file created");
                cb(97, "backupUploading");
            })
            .then(() => removeBackupFile(destFile))
            .then(() => {
                General.logDebug("BackupRestoreRealmService", "Removing database backup compressed file created");
                cb(99, "backupUploading");
            })
            .then(() => removeBackupFile(destZipFile))
            .then(() => cb(100, "backupCompleted"))
            .catch((error) => {
                General.logError("BackupRestoreRealmService", error);
                throw error;
            });
    }

    restore(cb) {
        let settingsService = this.getService(SettingsService);
        let mediaService = this.getService(MediaService);
        let entitySyncStatusService = this.getService(EntitySyncStatusService);
        let downloadedFile = `${fs.DocumentDirectoryPath}/${General.randomUUID()}.zip`;
        let downloadedUncompressedDir = `${fs.DocumentDirectoryPath}/${General.randomUUID()}`;

        General.logInfo("BackupRestoreRealm", `To be downloaded file: ${downloadedFile}, Unzipped directory: ${downloadedUncompressedDir}, Realm file: ${REALM_FILE_FULL_PATH}`);

        cb(1, "restoreCheckDb");
        return get(`${settingsService.getSettings().serverURL}/media/mobileDatabaseBackupUrl/exists`)
            .then((exists) => {
                General.logDebug("BackupRestoreRealmService", `Backup file exists:${exists}`);
                if (exists === "true") {
                    get(`${settingsService.getSettings().serverURL}/media/mobileDatabaseBackupUrl/download`)
                        .then((url) => mediaService.downloadFromUrl(url, downloadedFile, (received, total) => {
                            cb(1 + (received * 85) / total, "restoreDownloadPreparedDb")
                        }))
                        .then(() => {
                            General.logDebug("BackupRestoreRealmService", "Decompressing downloaded database dump");
                            cb(87, "restoringDb");
                        })
                        .then(() => unzip(downloadedFile, downloadedUncompressedDir))
                        .then(() => {
                            General.logDebug("BackupRestoreRealmService", "Deleting local database");
                            cb(89, "restoringDb");
                        })
                        .then(() => fs.exists(REALM_FILE_FULL_PATH))
                        .then((exists) => exists && fs.unlink(REALM_FILE_FULL_PATH))
                        .then(() => {
                            General.logDebug("BackupRestoreRealmService", "Create database from downloaded file");
                            cb(90, "restoringDb");
                        })
                        .then(() => fs.readDir(downloadedUncompressedDir))
                        .then((files) => _.find(files, (file) => file.name.endsWith("realm")).path)
                        .then((fullFilePath) => {
                            General.logInfo("BackupRestoreRealm", `Replacing realm file with: ${fullFilePath}`);
                            return fs.copyFile(fullFilePath, REALM_FILE_FULL_PATH);
                        })
                        .then(() => {
                            General.logDebug("BackupRestoreRealmService", "Refreshing application context");
                            cb(92, "restoringDb");
                        })
                        .then(() => this.notify())
                        .then(() => {
                            General.logDebug("BackupRestoreRealmService", "Removing downloaded files");
                            cb(94, "restoringDb");
                        })
                        .then(() => entitySyncStatusService.setup(EntityMetaData.model()))
                        .then(() => removeBackupFile(downloadedFile))
                        .then(() => removeBackupFile(downloadedUncompressedDir))
                        .then(() => {
                            General.logDebug("BackupRestoreRealmService", "Personalising database");
                            cb(97, "restoringDb");
                        })
                        .then(() => this._deleteUserInfoAndIdAssignment())
                        .then(() => this._deleteUserGroups())
                        .then(() => {
                            General.logDebug("BackupRestoreRealmService", "Personalisation of database complete");
                            cb(100, "restoreComplete");
                        })
                        .catch((error) => {
                            General.logErrorAsInfo("BackupRestoreRealm", error);
                            cb(100, "restoreFailed", true, error.message);
                        });
                } else {
                    cb(100, "restoreNoDump");
                }
            })
            .catch((error) => {
                General.logErrorAsInfo("BackupRestoreRealm", error);
                if (error.errorText) {
                    error.errorText.then(message => cb(100, "restoreFailed", true, message));
                } else {
                    cb(100, "restoreFailed", true, error.message);
                }
            });
    }

    _deleteUserInfoAndIdAssignment() {
        const db = this.db;

        const entitySyncStatus = db.objects(EntitySyncStatus.schema.name)
            .filtered(`entityName = 'IdentifierAssignment' or entityName = 'UserInfo'`)
            .map(u => _.assign({}, u));

        this.db.write(() => {
            const objects = db.objects(UserInfo.schema.name);
            const assignmentObjects = db.objects(IdentifierAssignment.schema.name);
            db.delete(objects);
            db.delete(assignmentObjects);
            entitySyncStatus.forEach(({uuid, entityName, entityTypeUuid}) => {
                const updatedEntity = EntitySyncStatus.create(entityName, EntitySyncStatus.REALLY_OLD_DATE, uuid, entityTypeUuid);
                db.create(EntitySyncStatus.schema.name, updatedEntity, true);
            })
        });
    }

    _deleteUserGroups() {
        const db = this.db;
        const myGroups = db.objects(EntitySyncStatus.schema.name)
            .filtered(`entityName = 'MyGroups'`)
            .map(u => _.assign({}, u));
        this.db.write(() => {
            db.delete(db.objects(MyGroups.schema.name));
            myGroups.forEach(({uuid, entityName, entityTypeUuid}) => {
                const updatedEntity = EntitySyncStatus.create(entityName, EntitySyncStatus.REALLY_OLD_DATE, uuid, entityTypeUuid);
                db.create(EntitySyncStatus.schema.name, updatedEntity, true);
            })
        });
    }
}

export const removeBackupFile = async (backupFilePath) => {
    await fs.exists(backupFilePath)
        .then((exists) => exists && fs.unlink(backupFilePath))
        .catch((error) => {
            General.logError(`Error while removing backup file, ${error.message}`);
            throw error;
        });
};
