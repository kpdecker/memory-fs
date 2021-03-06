var should = require("should");
var MemoryFileSystem = require("../lib/MemoryFileSystem");

describe("directory", function() {
	it("should have a empty root directory as startup", function(done) {
		var fs = new MemoryFileSystem();
		fs.readdirSync("/").should.be.eql([]);
		var stat = fs.statSync("/");
		stat.isFile().should.be.eql(false);
		stat.isDirectory().should.be.eql(true);
		fs.readdir("/", function(err, files) {
			if(err) throw err;
			files.should.be.eql([]);
			done();
		});
	});
	it("should make and remove directories (linux style)", function() {
		var fs = new MemoryFileSystem();
		fs.mkdirSync("/test");
		fs.mkdirSync("/test//sub/");
		fs.mkdirpSync("/test/sub2");
		fs.mkdirSync("/root\\dir");
		fs.mkdirpSync("/");
		fs.mkdirSync("/");
		fs.readdirSync("/").should.be.eql(["test", "root\\dir"]);
		fs.readdirSync("/test/").should.be.eql(["sub", "sub2"]);
		fs.rmdirSync("/test/sub//");
		fs.readdirSync("//test").should.be.eql(["sub2"]);
		fs.rmdirSync("/test/sub2");
		fs.rmdirSync("/test");
		(function() {
			fs.readdirSync("/test");
		}).should.throw();
		fs.readdirSync("/").should.be.eql(["root\\dir"]);
		fs.mkdirpSync("/a/depth/sub/dir");
		var stat = fs.statSync("/a/depth/sub");
		stat.isFile().should.be.eql(false);
		stat.isDirectory().should.be.eql(true);
	});
	it("should make and remove directories (windows style)", function() {
		var fs = new MemoryFileSystem();
		fs.mkdirSync("C:\\");
		fs.mkdirSync("C:\\test");
		fs.mkdirSync("C:\\test\\\\sub/");
		fs.mkdirpSync("c:\\test/sub2");
		fs.mkdirSync("C:\\root-dir");
		fs.readdirSync("C:").should.be.eql(["test", "root-dir"]);
		fs.readdirSync("C:/test/").should.be.eql(["sub", "sub2"]);
		fs.rmdirSync("C:/test\\sub\\\\");
		fs.readdirSync("C:\\\\test").should.be.eql(["sub2"]);
		fs.rmdirSync("C:\\test\\sub2");
		fs.rmdirSync("C:\\test");
		(function() {
			fs.readdirSync("C:\\test");
		}).should.throw();
		fs.readdirSync("C:").should.be.eql(["root-dir"]);
		fs.mkdirpSync("D:\\a\\depth\\sub\\dir");
		var stat = fs.statSync("D:\\a\\depth\\sub");
		stat.isFile().should.be.eql(false);
		stat.isDirectory().should.be.eql(true);
		fs.readdirSync("D:\\//a/depth/\\sub").should.be.eql(["dir"]);
	});
});
describe("files", function() {
	it("should make and remove files", function() {
		var fs = new MemoryFileSystem();
		fs.mkdirSync("/test");
		var buf = new Buffer("Hello World", "utf-8");
		fs.writeFileSync("/test/hello-world.txt", buf);
		fs.readFileSync("/test/hello-world.txt").should.be.eql(buf);
		fs.readFileSync("/test/hello-world.txt", "utf-8").should.be.eql("Hello World");
		(function() {
			fs.readFileSync("/test/other-file");
		}).should.throw();
		(function() {
			fs.readFileSync("/test/other-file", "utf-8");
		}).should.throw();
		fs.writeFileSync("/a", "Test", "utf-8");
		fs.readFileSync("/a", "utf-8").should.be.eql("Test");
		var stat = fs.statSync("/a");
		stat.isFile().should.be.eql(true);
		stat.isDirectory().should.be.eql(false);
	});
});
describe("errors", function() {
	it("should fail on invalid paths", function() {
		var fs = new MemoryFileSystem();
		fs.mkdirpSync("/test/a/b/c");
		fs.mkdirpSync("/test/a/bc");
		fs.mkdirpSync("/test/abc");
		(function() {
			fs.mkdirpSync("xyz");
		}).should.throw();
		(function() {
			fs.readdirSync("/test/abc/a/b/c");
		}).should.throw();
		(function() {
			fs.readdirSync("/abc");
		}).should.throw();
		(function() {
			fs.statSync("/abc");
		}).should.throw();
		(function() {
			fs.mkdirSync("/test/a/d/b/c");
		}).should.throw();
		(function() {
			fs.writeFileSync("/test/a/d/b/c", "Hello");
		}).should.throw();
		(function() {
			fs.readFileSync("/test/a/d/b/c");
		}).should.throw();
		(function() {
			fs.readFileSync("/test/abcd");
		}).should.throw();
		(function() {
			fs.mkdirSync("/test/abcd/dir");
		}).should.throw();
		(function() {
			fs.unlinkSync("/test/abcd");
		}).should.throw();
		(function() {
			fs.unlinkSync("/test/abcd/file");
		}).should.throw();
		(function() {
			fs.statSync("/test/a/d/b/c");
		}).should.throw();
		(function() {
			fs.statSync("/test/abcd");
		}).should.throw();
		fs.mkdir("/test/a/d/b/c", function(err) {
			err.should.be.instanceof(Error);
		});
	});
	it("should fail incorrect arguments", function() {
		var fs = new MemoryFileSystem();
		(function() {
			fs.writeFileSync("/test");
		}).should.throw();
	});
	it("should fail on wrong type", function() {
		var fs = new MemoryFileSystem();
		fs.mkdirpSync("/test/dir");
		fs.mkdirpSync("/test/dir");
		fs.writeFileSync("/test/file", "Hello");
		(function() {
			fs.writeFileSync("/test/dir", "Hello");
		}).should.throw();
		(function() {
			fs.readFileSync("/test/dir");
		}).should.throw();
		(function() {
			fs.writeFileSync("/", "Hello");
		}).should.throw();
		(function() {
			fs.rmdirSync("/");
		}).should.throw();
		(function() {
			fs.unlinkSync("/");
		}).should.throw();
		(function() {
			fs.mkdirSync("/test/dir");
		}).should.throw();
		(function() {
			fs.mkdirSync("/test/file");
		}).should.throw();
		(function() {
			fs.mkdirpSync("/test/file");
		}).should.throw();
		(function() {
			fs.readdirSync("/test/file");
		}).should.throw();
		fs.readdirSync("/test/").should.be.eql(["dir", "file"]);
	});
});
describe("async", function() {
	it("should be able to use the async versions", function(done) {
		var fs = new MemoryFileSystem();
		fs.mkdirp("/test/dir", function(err) {
			if(err) throw err;
			fs.writeFile("/test/dir/a", "Hello", function(err) {
				if(err) throw err;
				fs.writeFile("/test/dir/b", "World", "utf-8", function(err) {
					if(err) throw err;
					fs.readFile("/test/dir/a", "utf-8", function(err, content) {
						if(err) throw err;
						content.should.be.eql("Hello");
						fs.readFile("/test/dir/b", function(err, content) {
							if(err) throw err;
							content.should.be.eql(new Buffer("World"));
							done();
						});
					});
				});
			});
		});
	});
	it("should return errors", function(done) {
		var fs = new MemoryFileSystem();
		fs.readFile("/fail/file", function(err, content) {
			err.should.be.instanceof(Error);
			fs.writeFile("/fail/file", "", function(err) {
				err.should.be.instanceof(Error);
				done();
			});
		});
	});
});
describe("join", function() {
	it("should join paths", function() {
		var fs = new MemoryFileSystem();
		fs.join("/", "a/b/c").should.be.eql("/a/b/c");
		fs.join("/a", "b/c").should.be.eql("/a/b/c");
		fs.join("/a/b", "c").should.be.eql("/a/b/c");
		fs.join("/a/", "b/c").should.be.eql("/a/b/c");
		fs.join("/a//", "b/c").should.be.eql("/a//b/c");
		fs.join("a", "b/c").should.be.eql("a/b/c");
		fs.join("a/b", "c").should.be.eql("a/b/c");
		fs.join("C:", "a/b").should.be.eql("C:/a/b");
		fs.join("C:\\", "a/b").should.be.eql("C:\\a/b");
		fs.join("C:\\", "a\\b").should.be.eql("C:\\a\\b");
	});
});