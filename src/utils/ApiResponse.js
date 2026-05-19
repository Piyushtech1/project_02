class ApiResponse {
    constructor(statuscode, data, massage = "Success"){
        this.statuscode = statuscode
        this.data = data
        this.massage = massage
        this.success =  statuscode < 400
    }
}