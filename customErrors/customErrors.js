class MissingParamError extends Error {
    constructor(message) {
        super(message);
        this.name = "MissingParamError";
    }
}

class IncorrectParamError extends Error {
    constructor(message) {
        super(message);
        this.name = "IncorrectParamError";
    }
}

class QueryError extends Error {
    constructor(message) {
        super(message);
        this.name = "QueryError";
    }
}


class MissingUserError extends Error {
    constructor(message) {
        super(message);
        this.name = "MissingUserError";
    }
}

class UserExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserExistsError";
    }
}

module.exports = {
    MissingParamError,
    IncorrectParamError,
    QueryError,
    MissingUserError,
    UserExistsError
}