import sinon from "sinon";
import { expect } from "chai";
import { GoogleDriveClient } from "../../dist/index.js";
import testResults from "./resources/directoryContentsResponse.json" assert { type: "json" };

const FAKE_TOKEN = "aaaaabbbbbbccccccddddddeeeeee";

describe("directoryContents", function () {
    describe("getDirectoryContents", function () {
        beforeEach(function () {
            this.requestSpy = sinon.stub().returns(
                Promise.resolve({
                    json: () => Promise.resolve(testResults),
                    ok: true,
                    status: 200,
                    statusText: "OK"
                })
            );
            this.client = new GoogleDriveClient(FAKE_TOKEN);
            this.client.patcher.patch("request", this.requestSpy);
        });

        it("returns a root tree node by default", function () {
            return this.client.getDirectoryContents().then(res => {
                expect(res).to.have.property("files").that.is.an("array");
                expect(res).to.have.property("children").that.is.an("array");
                expect(res).to.have.property("id").that.is.null;
                expect(res).to.have.property("filename").that.is.null;
            });
        });

        it("returns file results", function () {
            return this.client.getDirectoryContents().then(res => {
                const [file] = res.files;
                expect(file).to.have.property("id").that.is.a("string");
                expect(file).to.have.property("filename").that.is.a("string");
                expect(file).to.have.property("filename").that.is.a("string");
                expect(file)
                    .to.have.property("mime")
                    .that.is.a("string")
                    .that.matches(/\w+\/\w+/);
                expect(file)
                    .to.have.property("type")
                    .that.is.a("string")
                    .that.matches(/^(file|directory)$/);
                expect(file).to.have.property("created").that.is.a("string");
                expect(file).to.have.property("modified").that.is.a("string");
                expect(file).to.have.property("size").that.is.a("number");
                expect(file).to.have.property("shared").that.is.a("boolean");
            });
        });

        it("returns an array of file results when tree:false", function () {
            return this.client.getDirectoryContents(false).then(res => {
                const [file] = res;
                expect(file).to.have.property("id").that.is.a("string");
                expect(file).to.have.property("filename").that.is.a("string");
                expect(file).to.have.property("filename").that.is.a("string");
                expect(file)
                    .to.have.property("mime")
                    .that.is.a("string")
                    .that.matches(/\w+\/\w+/);
                expect(file)
                    .to.have.property("type")
                    .that.is.a("string")
                    .that.matches(/^(file|directory)$/);
                expect(file).to.have.property("created").that.is.a("string");
                expect(file).to.have.property("modified").that.is.a("string");
                expect(file).to.have.property("size").that.is.a("number");
                expect(file).to.have.property("shared").that.is.a("boolean");
            });
        });
    });

    describe("mapDirectoryContents", function () {
        beforeEach(function () {
            this.requestSpy = sinon.stub().returns(
                Promise.resolve({
                    json: () => Promise.resolve(testResults),
                    ok: true,
                    status: 200,
                    statusText: "OK"
                })
            );
            this.client = new GoogleDriveClient(FAKE_TOKEN);
            this.client.patcher.patch("request", this.requestSpy);
        });

        it("returns the contents for a sub-directory", function () {
            return this.client.mapDirectoryContents("/Documents").then(res => {
                expect(res).to.have.lengthOf(1);
                expect(res[0]).to.have.property("filename", "Project translation");
                expect(res[0]).to.have.property("dirPath", "/Documents");
            });
        });

        it("returns the contents for the root", function () {
            return this.client.mapDirectoryContents("/").then(res => {
                expect(res).to.have.length.above(1);
                res.forEach(item => {
                    expect(item.filename).to.not.equal("Project translation");
                    expect(item.dirPath).to.equal("/");
                });
            });
        });

        it("returns the contents for a sub-directory", function () {
            return this.client.mapDirectoryContents("/Documents").then(res => {
                expect(res).to.have.lengthOf(1);
                expect(res[0]).to.have.property("filename", "Project translation");
                expect(res[0]).to.have.property("dirPath", "/Documents");
            });
        });

        it("uses the cached contents when available", function () {
            sinon.spy(this.client.patcher, "execute");
            return this.client
                .mapDirectoryContents("/Documents")
                .then(() => this.client.mapDirectoryContents("/Documents"))
                .then(() => {
                    expect(this.client.patcher.execute.callCount).to.equal(1);
                });
        });
    });
});
