var WebdavClient = function () {

	//#region variables
	this.webdavServer = null;
	this.webdavShare = null;
	this.webdavUser = null;
	this.webdavPassword = null;
	//#endregion

	//#region properties
	this.getWebdavServer = function() {
		return this.webdavServer;
	};

	this.setWebdavServer = function(webdavServer) {
		return this.webdavServer = webdavServer;
	};

	this.getWebdavShare = function() {
		return this.webdavShare;
	};

	this.setWebdavShare = function(webdavShare) {
		return this.webdavShare = webdavShare;
	};

	this.getWebdavUser = function() {
		return this.webdavUser;
	};

	this.setWebdavUser = function(webdavUser) {
		return this.webdavUser = webdavUser;
	};

	this.getWebdavPassword = function() {
		return this.webdavPassword;
	};

	this.setWebdavPassword = function(webdavPassword) {
		return this.webdavPassword = webdavPassword;
	};
	//#endregion

	this.getContentListRequestXml = function() {
		return "<?xml version='1.0'?>\
			<a:propfind xmlns:a='DAV:'>\
				<a:prop>\
					<a:resourcetype/>\
				</a:prop>\
			</a:propfind>";
	};
			
	this.convertContentListXmlToJson = function(contentListXml) {
			
		let items = [];
		let responses = $(contentListXml)
			.find("D\\:response");
		
		responses.each(function(i, element) {
			let item = {
				href : $(element)
					.find("D\\:href")
					.text()
			};
				
			if ($(element)
					.find("D\\:collection")
					.length == 1) {
				item.type = "directory";
			}
			else {
				item.type = "file";
			}
			
			items.push(item);
		});
		
		return items;
	};
			
	this.transformContentListXmlToJson = function(contentXml, currentDirectory) {
		let responses = $(contentXml)
			.find("D\\:response");
			
		let items = [];
		
		responses.each(function(i, element) {
			let item = {
				href : $(element)
					.find("D\\:href")
					.text(),
				name : $(element)
					.find("D\\:href")
					.text()
					.replace(currentDirectory, "")
			};
			
			if (item.name == "") {
				item.name = ".";
			}
				
			if ($(element)
					.find("D\\:collection")
					.length == 1) {
				item.type = "directory";
			}
			else {
				item.type = "file";
			}
			
			items.push(item);
		});
		
		console.log(items);
			
		return items;
	};

	this.getContentList = function() {
		$.ajax(
		{
			type: "PROPFIND",
			url: webdavUrl,
			dataType : "xml",
			contentType: "text/xml",
			data : this.getContentListRequestXml(),
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "Basic " + btoa(this.getWebdavUser() + ":" + this.getWebdavPassword()));
				xhr.setRequestHeader("Depth", 1);
			},
			success: function (data, textStatus, jqXHR) {
				console.info("success\n");
				let contentList = transformContentList(data, (webdavDirectory));
				
				$("#list-content-container")
					.append(
						$("<ul></ul>")
					);
				
				$(contentList)
					.each(function(i, element) {
						$("#list-content-container ul")
							.append(
								$("<li></li>")
									.append(
										$("<a></a>")
											.attr("href", "?webdav-directory=" + element.href)
											.text(element.name + " (" + element.type + ")")
									)
							);
					});
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.error("error");
				console.log(jqXHR);
			}
		});
	};
}
