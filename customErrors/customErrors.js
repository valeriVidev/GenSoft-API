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

class ArticleExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = "ArticleExistsError";
    }
}

class PropertyExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = "PropertyExistsError";
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
    ArticleExistsError,
    PropertyExistsError,
    MissingUserError,
    UserExistsError
}