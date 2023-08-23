const HomeController = {
  getListApi: (req, res) => {
    res.json({
      Message: "Welcome to our api!",
      Host: "http://localhost:2000",
      Data: [
        {
          Endpoint: "/userAuthorization",
        },
        { Endpoint: "/adminAuthorization" },
      ],
    });
  },
  userAuthorization: (req, res) => {
    res.json({
      Message: "Welcome to our api!",
      Host: "http://localhost:2000",
      Authorization: "User",
      Data: [
        {
          Endpoint: "/api/auth/register",
          Method: "post",
          Request: {
            Body: "username, email, password ",
          },
          Description: "Api to register user",
        },
        {
          Endpoint: "/api/auth/login",
          Method: "post",
          Request: {
            Body: "usernameOrEmail, password",
          },
          Description: "Api to login user",
        },
        {
          Endpoint: "/api/password/change",
          Method: "patch",
          Request: {
            Body: "password, newPassword",
            Authorization: "token",
          },
          Description: "Api to change password",
        },
        {
          Endpoint: "/api/password/send",
          Method: "patch",
          Request: {
            Body: "email",
          },
          Description: "Api to send forgot email",
        },
        {
          Endpoint: "/api/password/reset?token=",
          Method: "post",
          Request: {
            Body: "password",
            Query: "token",
          },
          Description: "Api to reset password",
        },
        {
          Endpoint: "/api/book",
          Method: "get",
          Description: "Api to get all book data",
        },
        {
          Endpoint: "/api/book/:id",
          Method: "get",
          Request: {
            Params: "id",
          },
          Description: "Api to get book by id",
        },
      ],
    });
  },
  adminAuthorization: (req, res) => {
    res.json({
      Message: "Welcome to our api!",
      Host: "http://localhost:2000",
      Authorization: "Admin",
      Data: [
        {
          Endpoint: "/api/book/",
          Method: "post",
          Request: {
            Body: "title, author, release_year, publisher, genre, pages, language",
            Authorization: "token",
          },
          Description: "Api to post new book",
        },
        {
          Endpoint: "/api/book/:id",
          Method: "patch",
          Request: {
            Params: "id",
            Authorization: "token",
          },
          Description: "Api to update book data",
        },
        {
          Endpoint: "/api/book/:id",
          Method: "delete",
          Request: {
            Params: "id",
            Authorization: "token",
          },
          Description: "Api to delete book by id",
        },
      ],
    });
  },
};

module.exports = HomeController;
