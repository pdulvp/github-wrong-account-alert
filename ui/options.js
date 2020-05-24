/* 
 This Code is published under the terms and conditions of the CC-BY-NC-ND-4.0
 (https://creativecommons.org/licenses/by-nc-nd/4.0)
 
 Please contribute to the current project.
 
 SPDX-License-Identifier: CC-BY-NC-ND-4.0
 @author: pdulvp@laposte.net
 */

var browser = adaptBrowser();
var rules = [];

function updateRules(response) {
	rules = response.rules;
	var left = document.getElementById("left");
	var activeIds = Array.from(left.childNodes).filter(x => hasClass(x, "active")).map(x => x.getAttribute("rule-id"));
	while (left.firstChild) {
		left.removeChild(left.lastChild);
	}
	rules.forEach(rule => {
		var item = createRuleEntry(rule.name);
		item.setAttribute("rule-id", rule.id);
		left.appendChild(item);
	});
	Array.from(left.childNodes).filter(x => activeIds.includes(x.getAttribute("rule-id"))).forEach(x => addClass(x, "active"));
}

registerEditor(document.getElementById("left"), editor => {
	var lastActiveId = editor.getAttribute("rule-id");
	let rule = rules.find(r => r.id == lastActiveId);
	if (rule != null) {
		return rule.name;
	}
	return "";

}, editor => {
	var lastActiveId = editor.getAttribute("rule-id");
	let rule = rules.find(r => r.id == lastActiveId);
	if (rule != null) {
		rule.name = editor.value;
	}
	saveOptions();
});

document.getElementById("left").addEventListener("keydown", event => {
	if (event.code == "Delete") {
		var left = document.getElementById("left");
		var ruleIds = Array.from(left.childNodes).filter(x => hasClass(x, "active")).map(x => x.getAttribute("rule-id"));
		
		if (ruleIds.length > 0) {
			let nextId = findNextAfterDeletion(rules, ruleIds[ruleIds.length-1]);
			rules = rules.filter(x => !ruleIds.includes(x.id));
			updateRules({rules: rules});
			clickOnRule(null, nextId);
			left.focus();
		}
		
		updateButton();
	}
});

document.getElementById("left").addEventListener("click", event => {
	if (hasClass(event.target, "left-pane-item")) {
		var lastActiveId = Array.from(left.childNodes).filter(x => hasClass(x, "active")).map(x => x.getAttribute("rule-id")).find(x => true);
		clickOnRule(lastActiveId, event.target.getAttribute("rule-id"));
	}
});

var table = document.getElementById("table-cache");
table.addEventListener("click", event => {
	let target = event.target;
	if (hasClass(target, "table-column")) {
		target = target.parentNode;
	}
	if (hasClass(target, "table-column-wrapper-2")) {
		target = target.parentNode;
	}
	if (hasClass(target, "table-column-wrapper")) {
		target = target.parentNode;
	}
	if (hasClass(target, "table-column")) {
		target = target.parentNode;
	}
	if (hasClass(target, "table-row")) {
		clickOnItem(target.getAttribute("id"));
	}
});

registerEditor(document.getElementById("table-cache"), editor => {
	var left = document.getElementById("left");
	var lastActiveId = Array.from(left.childNodes).filter(x => hasClass(x, "active")).map(x => x.getAttribute("rule-id")).find(x => true);
	let rule = rules.find(r => r.id == lastActiveId);
	if (rule) {
		var lastItemId = editor.getAttribute("item-id");
		var itemData = editor.getAttribute("item-data");
		let item = rule.items.find(i => i.id == lastItemId);
		if (item != null) {
			return item[itemData];
		}
	}
	return "";

}, editor => {
	var left = document.getElementById("left");
	var lastActiveId = Array.from(left.childNodes).filter(x => hasClass(x, "active")).map(x => x.getAttribute("rule-id")).find(x => true);
	let rule = rules.find(r => r.id == lastActiveId);
	if (rule) {
		var lastItemId = editor.getAttribute("item-id");
		var itemData = editor.getAttribute("item-data");
		let item = rule.items.find(i => i.id == lastItemId);
		if (item != null) {
			item[itemData] = editor.value;
		}
		saveOptions();
	}
	return "";
});

function findNextAfterDeletion(items, id) {
	let nextId = null;
	let lastIndex = items.findIndex(x => x.id == id);
	if (lastIndex >= 0 && lastIndex < items.length -1) {
		nextId = items[lastIndex + 1].id;
	} else if (lastIndex > 0) {
		nextId = items[lastIndex - 1].id;
	}
	return nextId;
}

document.getElementById("table-cache").addEventListener("keydown", event => {
	if (event.code == "Delete") {
		var left = document.getElementById("left");
		var cache = document.getElementById("table-cache");
		var itemIds = Array.from(cache.childNodes).filter(x => hasClass(x, "active")).map(x => x.getAttribute("id"));
		
		var lastRuleId = Array.from(left.childNodes).filter(x => hasClass(x, "active")).map(x => x.getAttribute("rule-id")).find(x => true);
		let rule = rules.find(r => r.id == lastRuleId);
		
		if (itemIds.length > 0) {
			let nextId = findNextAfterDeletion(rule.items, itemIds[itemIds.length-1]);
			rule.items = rule.items.filter(x => !itemIds.includes(x.id));
			
			updateRules({rules: rules});
			clickOnRule(lastRuleId, lastRuleId);
			clickOnItem(nextId);
			cache.focus();
		}
		updateButton();

	}
});

function clickOnItem(itemId) {
	var cache = document.getElementById("table-cache");
	Array.from(cache.childNodes).forEach(x => removeClass(x, "active"));
	Array.from(cache.childNodes).filter(x => x.getAttribute("id") == itemId).forEach(x => addClass(x, "active"));
}

function clickOnRule(previousRuleId, ruleId) {
	if (previousRuleId != null) {
		saveCurrentRule(previousRuleId);
	}
	
	Array.from(left.childNodes).forEach(x => removeClass(x, "active"));
	Array.from(left.childNodes).filter(x => x.getAttribute("rule-id") == ruleId).forEach(x => addClass(x, "active"));

	let rule = rules.filter(x => x.id == ruleId)[0];
	
	var table = document.getElementById("table-cache");
	while (table.childNodes.length > 1) {
		table.removeChild(table.lastChild);
	}
	if (rule != undefined && rule.items) {
		rule.items.forEach(i => {
			table.appendChild(createCacheEntry(i));
		});
	}

	updateButton();
}

function updateButton() {
	var left = document.getElementById("left");
	var lastRuleId = Array.from(left.childNodes).filter(x => hasClass(x, "active")).map(x => x.getAttribute("rule-id")).find(x => true);
	var restrictions = document.getElementById("button-new-item");
	restrictions.disabled = (lastRuleId == undefined);
}

function setItemResult(itemResult) {
	var table = document.getElementById("table-cache");
	var row = Array.from(table.childNodes).find(e => e.id == itemResult.id);
	let icon = Array.from(row.childNodes).find(e => e.getAttribute("class") == "table-column table-column-icon");
	let value = Array.from(Array.from(Array.from(row.childNodes).find(e => e.getAttribute("class") == "table-column-wrapper").childNodes).find(e => e.getAttribute("class") == "table-column-wrapper-2").childNodes).find(e => e.getAttribute("class") == "table-column table-column-value");
	if (icon) {
		if (itemResult.valid) {
			addClass(row, "valid");
			addClass(icon, "icon-valid");
			value.textContent = itemResult.value;
		} else {
			addClass(row, "warning");
			addClass(icon, "icon-warning");
			value.textContent = " ";
		}
	}
}

function saveCurrentRule(ruleId) {
	console.log("saveCurrentRule");
	if (ruleId) {
		let rule = rules.find(r => r.id == ruleId);
		if (rule) {
			if (document.getElementById("field-sitematch")) {
				rule.sitematch = document.getElementById("field-sitematch").value;
			}
		}
	}
}

function createRuleEntry(label) {
    var node = document.createElement("input");
	addClass(node, "left-pane-item");
	node.value = label;
	node.setAttribute("readonly", "readonly");
	return node;
}

function createCacheEntry(item) {
	let node = document.createElement("div");
	node.setAttribute("id", item.id);
	addClass(node, "table-row");

	let child = null;
	child = document.createElement("div");
	addClass(child, "table-column table-column-icon");
	child.textContent = item.icon;
	node.appendChild(child);

	let childWrapper = document.createElement("div");
	addClass(childWrapper, "table-column-wrapper");
	node.appendChild(childWrapper);

	child = document.createElement("input");
	addClass(child, "table-column table-column-name");
	child.setAttribute("item-id", item.id);
	child.setAttribute("item-data", "name");
	child.value = item.name;
	child.setAttribute("readonly", "readonly");
	childWrapper.appendChild(child);

	let childWrapper2 = document.createElement("div");
	addClass(childWrapper2, "table-column-wrapper-2");
	childWrapper.appendChild(childWrapper2);

	child = document.createElement("input");
	child.setAttribute("type", "text");
	addClass(child, "table-column table-column-xpath");
	child.setAttribute("item-id", item.id);
	child.setAttribute("item-data", "xpath");
	child.value = item.xpath;
	child.setAttribute("readonly", "readonly");
	childWrapper2.appendChild(child);

	child = document.createElement("div");
	addClass(child, "table-column table-column-value");
	child.textContent = "";
	childWrapper2.appendChild(child);

	return node;
}


function clickPopupItem(event) {
	console.log(event);
}

 document.getElementById("button-new-rule").onclick = function (event) {
	console.log(rules);
	let ruleName = browser.i18n.getMessage("new_rule_name", ""+(rules.length+1));
	rules.push({ id: uuidv4(), name: ruleName, sitematch: "", items: [] });
	updateRules( { rules: rules } );
 };

 document.getElementById("button-new-item").onclick = function (event) {
	 if (event.target.disabled) {
		 return;
	 }
	var lastActiveId = Array.from(left.childNodes).filter(x => hasClass(x, "active")).map(x => x.getAttribute("rule-id")).find(x => true);
	let rule = rules.find(r => r.id == lastActiveId);
	if (rule) {
		let itemName = browser.i18n.getMessage("new_item_name", ""+(rule.items.length+1));
		rule.items.push({ id: uuidv4(), name: itemName, xpath: ".*" });
	}
	updateRules( { rules: rules } );
	clickOnRule(lastActiveId, lastActiveId);
 };
 
 function saveOptions() {
	browser.storage.local.set({
		"rules": rules
	}).then(() => {
		browser.storage.onChanged.removeListener(logStorageChange);
	}, (error) => {
		console.log(error);
		browser.storage.onChanged.removeListener(logStorageChange);
	});
 }
function restoreWindow() {
	var urlParams = new URLSearchParams(window.location.search);
	if (urlParams.has('initialRule')) {
		lastActiveId = urlParams.get('initialRule');
		let itemId = null;
		if (urlParams.has('initialItem')) {
			itemId = urlParams.get('initialItem');
		}
		restoreOptions(lastActiveId, itemId);
	} else {
		restoreOptions(0);
	}
}

function restoreOptions(idIndex, itemId) {
	let ruleIdIndex = idIndex;
	var lastActiveId = Array.from(left.childNodes).filter(x => hasClass(x, "active")).map(x => x.getAttribute("rule-id")).find(x => true);
	if (lastActiveId != null) {
		ruleIdIndex = idIndex;
	}
	
	browser.storage.local.get('rules').then((res) => {
		if (res.rules && Array.isArray(res.rules)) {
			updateRules( { rules: res.rules } );
			let ruleId = ruleIdIndex;
			if (Number.isInteger(ruleIdIndex) && ruleIdIndex < rules.length) {
				ruleId = rules[ruleIdIndex].id;
			}
			let rule = rules.find(r => r.id == ruleId);
			if (rule) {
				clickOnRule(null, ruleId);
				clickOnItem(itemId);
			}
		} else {
			updateRules( { rules: [] } );
		}
	}, (error) => {
		updateRules( { rules: [] } );
	});
}

function logStorageChange(changes) {
	restoreOptions();
}

document.getElementById("option-description").textContent = browser.i18n.getMessage("option_description");
document.getElementById("button-new-rule").textContent = browser.i18n.getMessage("button_new_rule");
document.getElementById("button-new-item").textContent = browser.i18n.getMessage("button_new_item");
document.getElementById("table-column-value").textContent = browser.i18n.getMessage("table_column_value");
document.getElementById("table-column-name").textContent = browser.i18n.getMessage("table_column_name");
document.getElementById("table-column-xpath").textContent = browser.i18n.getMessage("table_column_xpath");


document.addEventListener('DOMContentLoaded', restoreWindow);
browser.storage.onChanged.addListener(logStorageChange);

function handleMessage(request, sender, sendResponse) {
	if (request.action == "setSelection") {
		restoreOptions(request.initialRule, request.initialItem);
	}
}

updateButton();
browser.runtime.onMessage.addListener(handleMessage);