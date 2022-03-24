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

	this.getWebdavUrl = function(folderPath) {
		return this.getWebdavServer() + "/" + this.getWebdavShare() + (folderPath == undefined ? "" : ("/" + folderPath));
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
			
	convertContentListXmlToJson = function(contentListXml) {
			
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
	
	formatContentList = function(contentList) {
		let currentDirectory = getCurrentDirectory(contentList);
		
		$(contentList).each(function(i, element) {
			element.name = element.href.replace(currentDirectory.href, "");
			
			if (element.name == "") {
				element.name = ".";
			}
		});
		
		return contentList;
	};
	
	getCurrentDirectory = function(contentList) {
		if (contentList == null ||
			contentList.length == 0) {
			
			return null;
		}
		
		let currentDirectory = contentList[0];
		
		$(contentList).each(function(i, element) {
			if (element.href.length < currentDirectory.href.length) {
				currentDirectory = element;
			}
		});
		
		return currentDirectory;
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

	this.getContentList = function(folderPath = "", callbackSuccess, callbackError) {
		let webdavUser = this.getWebdavUser();
		let webdavPassword = this.getWebdavPassword();
		let webdavUrl = this.getWebdavUrl(folderPath);
		
		$.ajax(
		{
			type: "PROPFIND",
			url: webdavUrl,
			dataType : "xml",
			contentType: "text/xml",
			data : this.getContentListRequestXml(),
			beforeSend: function(xhr) {
				xhr.setRequestHeader("Authorization", "Basic " + btoa(webdavUser + ":" + webdavPassword));
				xhr.setRequestHeader("Depth", 1);
			},
			success: function (data, textStatus, jqXHR) {
				callbackSuccess(
					formatContentList(
						convertContentListXmlToJson(data)
					)
				);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				callbackError(jqXHR, textStatus, errorThrown);
			}
		});
	};
}