class ApiError extends Error{
    constructor(
        statusCode,
        massage="something want wrong",
        errors = [],
        statck = ""
    ){
        super(massage)
        this.statusCode = statusCode
        this.data = null
        this.massage = massage
        this.success = false;
        this.errors = errors


        if(statck){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError