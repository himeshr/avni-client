import moment from "moment";
import ResourceUtil from "../utility/ResourceUtil";

class Individual {
    static schema = {
        name: "Individual",
        properties: {
            name: "string",
            dateOfBirth: "date",
            dateOfBirthEstimated: "bool",
            gender: "string",
            lowestAddressLevel: {type: "list", objectType: "AddressLevel"},
            detailedAddress: {type: "string", optional: true},
            userDefined: {type: "list", objectType: "UserDefinedIndividualProperty"}
        }
    };

    static create(name, dateOfBirth, gender, lowestAddressLevel) {
        var individual = new Individual();
        individual.name = name;
        individual.dateOfBirth = dateOfBirth;
        individual.dateOfBirthEstimated = false;
        individual.gender = gender;
        individual.lowestAddressLevel = lowestAddressLevel;
        return individual;
    }

    static fromResource(individualResource, entityService) {
        var addressLevel = entityService.findByKey("uuid", ResourceUtil.getUUIDFor("address"));
        return Individual.create(individualResource.name, individualResource.dateOfBirth, individualResource.dateOfBirthEstimated, addressLevel);
    }

    static getDisplayAge(individual) {
        var ageInYears = moment().diff(individual.dateOfBirth, 'years');
        return ageInYears > 0 ? `${ageInYears} years` : `${moment().diff(individual.dateOfBirth, 'months')} months`;
    }

    toSummaryString() {
        return `${this.name}, Age: ${Individual.getDisplayAge(this)}, ${this.gender}`;
    }
}

export default Individual;