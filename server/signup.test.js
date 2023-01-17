const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const app = require("./index");
const signUpController = require("./controller/auth.controller");
const User = require("./models/user/user.model");
const { expect } = require("chai");

describe("SignUp Controller", () => {
  beforeEach(async () => {
    const testuser = new User({
      firstName: "test2mocha",
      lastName: "signup2",
      email: "test2@gmail.com",
      tel: "00000000",
      password: "ffffffff",
    });
    await testuser.save();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  it("Créer un nouveau utilisateur", (done) => {
    chai
      .request("http://localhost:7200")
      .post("/register")
      .send({
        firstName: "test1mocha",
        lastName: "signup1",
        email: "test1@gmail.com",
        tel: "00000000",
        password: "00000000",
      })
      .end((err, res) => {
        // expect(res).to.have.status(201);
        // expect(res.body)
        //   .to.have.property("message")
        //   .equal(`L'utilsateur crée avec succes`);
        done();
      });
  });
});
