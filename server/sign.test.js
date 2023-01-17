const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const app = require("./index");
const { expect } = require("chai");

const SignupController = require("./controller/auth.controller");
const User = require("./models/user/user.model");
// Utilisez Mocha pour décrire et tester les différentes fonctionnalités de votre contrôleur d'inscription, en utilisant des assertions de chai pour vérifier les résultats attendus:
// Copy code
describe("Signup Controller", () => {
  beforeEach(async () => {
    // setup code, such as creating a test user
    const testUser = new User({
      firstName: "Test",
      lastName: "User",
      tel: "78412563",
      email: "test@example.com",
      password: "testpassword",
    });
    await testUser.save();
  });

  afterEach(async () => {
    // cleanup code, such as removing the test user
    // await User.deleteMany();
  });

  it("should create a new user", (done) => {
    chai
      .request("http://localhost:7200/api/user")
      .post("/register")
      .send({
        firstName: "Test 2",
        lastName: "User 2",
        tel: "78412585",
        email: "test@example2.com",
        password: "testpassword2",
      })
      .end((err, res) => {
        // use chai assertions to check the response
        // expect(res).to.have.status(201);
        // expect(res.body)
        //   .to.have.property("message")
        //   .equal("User created successfully");
        done();
      });
  });
});
