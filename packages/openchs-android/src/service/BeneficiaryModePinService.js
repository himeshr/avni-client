import BaseService from "./BaseService";
import Service from "../framework/bean/Service";
import {BeneficiaryModePin} from 'openchs-models';
import General from "../utility/General";

@Service("beneficiaryModePinService")
class BeneficiaryModePinService extends BaseService {
    constructor(db, beanStore) {
        console.log('calling constructor');
        super(db, beanStore);
    }

    getSchema() {
        return BeneficiaryModePin.schema.name;
    }

    isPinGood(pin) {
        return _.isNumber(pin) && !_.isNaN(pin);
    }

    setPin(pin) {
        //Usually not required, this is just ensuring that there is just one Pin in the db.
        this.resetPin();

        if (this.isPinGood(pin)) {
            this._setPin(pin);
        }
    }

    _setPin(pin) {
        const db = this.db;
        const schema = this.getSchema();
        const newPin = new BeneficiaryModePin();
        newPin.pin = pin;

        db.write(() => {
            db.create(schema, newPin);
        });
    }

    pinMatches(pin) {
        return this.findByKey('pin', pin);
    }

    resetPin() {
        const db = this.db;
        const schema = this.getSchema();
        db.write(() => {
            const existingPins = db.objects(schema);
            db.delete(existingPins);
        });
    }
}

export default BeneficiaryModePinService;