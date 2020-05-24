/* 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
 */


var browser = adaptBrowser();

function restoreOptions() {
	browser.storage.local.get('rules').then((res) => {
		if (res.rules && Array.isArray(res.rules)) {
			getRulesResult( { rules: res.rules} );
		} else {
			getRulesResult( { rules: []} );
		}
	}, (error) => {
		getRulesResult( { rules: []} );
	});
}

function handleMessage(request, sender, sendResponse) {
	
}

function doesMatchAccount(document, name) {
	try {
		let metas = Array.from(document.getElementsByTagName('meta'));
		let profile = metas.find(x => x != null && x != undefined && "user-login" == x.getAttribute("name"));
		if (profile != undefined) {
			return profile.getAttribute("content") == name;
		}
	} catch (e) {
		console.log(e);
	}
	return false;
}

function doesMatchProject(url, organization, projects) {
	if (projects == undefined || projects.length == 0) {
		return false;
	}
	let tt = new RegExp(`https:\/\/github\.com\/${organization}\/${projects}`);
	return tt.test(url);
}

function getRulesResult(storage) {
	let match = storage.rules.filter(r => doesMatchAccount(document, r.name)).filter(r => {
		return r.items.filter(i => doesMatchProject(document.URL, i.name, i.xpath)).length > 0;
	});
	if (match.length > 0) {
		highlight(document);
	} else {
		unhighlight(document);
	}
}

function unhighlight(element) {
	let previous = element.getAttribute("previous");
	if (previous != null) {
		element.setAttribute("style", previous);
	} else {
		element.removeAttribute("style");
		element.removeAttribute("previous");
	}
}

function highlight(element) {
	let header = element.getElementsByTagName("header")[0];
	if (!header.hasAttribute("previous")) {
		header.setAttribute("previous", header.getAttribute("style"));
	}
	header.setAttribute("style", "background-color: red; border: 5px solide red;");
}

browser.runtime.onMessage.addListener(handleMessage);
browser.storage.onChanged.addListener(restoreOptions);

restoreOptions();