/* ========================================= ОБЩИЕ СКРИПТЫ ========================================= */
const inittedInputs = [];

function findInittedInput(selector, isAll = false) {
    // isAll == true: вернет array, isAll == false: вернет первый найденный по селектору элемент
    const selectorNodes = Array.from(document.querySelectorAll(selector));
    if (!isAll) {
        const input = inittedInputs.find(arrayHandler);
        return input || null;
    } else {
        const inputs = inittedInputs.filter(arrayHandler);
        return inputs || null;
    }

    function arrayHandler(inpClass) {
        return selectorNodes.includes(inpClass.rootElem);
    }
}

function createElement(tagName, className, insertingHTML) {
    let element = document.createElement(tagName);
    if (className) element.className = className;
    if (insertingHTML) element.insertAdjacentHTML("afterbegin", insertingHTML);
    return element;
}

class _LocalStorage {
    setItem(key, value) {
        const item = JSON.stringify(value);
        localStorage.setItem(key, item);
    }
    getItem(key) {
        const item = localStorage.getItem(key);
        return JSON.parse(item);
    }
}
const _localStorage = new _LocalStorage();

class Cookie {
    constructor(node) {
        this.onOkClick = this.onOkClick.bind(this);
        this.onLearnMoreClick = this.onLearnMoreClick.bind(this);

        this.rootElem = node;
        this.cookieKey = "vsevn_ad_cookie";
        this.okButton = this.rootElem.querySelector(".cookie__button--ok");
        this.learnMoreButton = this.rootElem.querySelector(".cookie__link--learn-more");

        const cookieData = _localStorage.getItem(this.cookieKey);
        if (cookieData && typeof cookieData === "object" && cookieData.accept) this.removeModal();
        this.okButton.addEventListener("click", this.onOkClick);
        this.learnMoreButton.addEventListener("click", this.onLearnMoreClick);
    }
    onOkClick() {
        this.removeModal();
        let cookieData = _localStorage.getItem(this.cookieKey);
        if (!cookieData || typeof cookieData !== "object") cookieData = {};
        cookieData.accept = true;
        _localStorage.setItem(this.cookieKey, cookieData);
    }
    removeModal() {
        this.rootElem.remove();
    }
    onLearnMoreClick() {

    }
}

class ChooseTabs {
    constructor(node) {
        this.tabChange = this.tabChange.bind(this);

        this.rootElem = node;
        this.tabs = this.rootElem.querySelectorAll("[data-tab-name]");

        this.tabs.forEach(tab => tab.addEventListener("click", this.tabChange));
    }
    tabChange(event) {
        const tab = event.currentTarget;
        this.tabs.forEach(otherTab => {
            if (otherTab !== tab) otherTab.classList.remove("active");
            tab.classList.add("active");
        });
        let rubrick = findInittedInput(".resume__rubricks");
        rubrick.show();

        let status = "";
        switch (tab.dataset.tabName) {
            case "tab-1": status = "соискатель";
            default:
                break;
            case "tab-2": status = "работодатель";
                break;
        }
        rubrick.setStatus(status);
    }
}

class Rubricks {
    constructor(node) {
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        this.limit = 3;
        this.statusSpan = this.rootElem.querySelector(".rubricks__status");
        this.checkboxesItems = Array.from(
            this.rootElem.querySelectorAll(".checkboxs__items_item")
        );

        this.rootElem.addEventListener("change", this.onChange);
    }
    show() {
        this.rootElem.classList.remove("none");
    }
    onChange(event) {
        const targInput = event.target;
        if (!Array.isArray(this.checked)) this.checked = [];
        const options = findInittedInput("#options");

        forbidPassCheckLimit.call(this);
        if (this.checked.length > 0) toggleOptions(true);
        else toggleOptions(false);
        options.setRubricks();

        function forbidPassCheckLimit() {
            if (targInput.checked) {

                if (this.checked.length < this.limit) this.checked.push(targInput);
                else {
                    targInput.checked = false;
                    const unchecked = this.checked.slice(this.limit);
                    unchecked.forEach(inp => inp.checked = false);
                    this.checked = this.checked.slice(0, this.limit);
                }
            } else {
                this.checked = this.checked.filter(inp => inp !== targInput);
            }

        }
        function toggleOptions(bool) {
            bool ? options.show() : options.hide();
        }
    }
    setStatus(status) {
        this.statusSpan.innerHTML = "";
        this.statusSpan.insertAdjacentText("afterbegin", status);
    }
}

class Options {
    constructor(node) {
        this.rootElem = node;
    }
    show() {
        this.rootElem.classList.remove("none");
    }
    hide() {
        this.rootElem.classList.add("none");
    }
    setRubricks() {
        const block = this.rootElem.querySelector(".rubricks-categories");
        const blockSpan = block.querySelector("span");
        const checkedRubricks = findInittedInput(".resume__rubricks").checked || [];

        let blockSpanInner = "";
        checkedRubricks.forEach((inp, i, arr) => {
            blockSpanInner += inp.value;
            if (i != arr.length - 1) blockSpanInner += ", ";
        });
        blockSpan.innerHTML = blockSpanInner;
    }
}

let inittingSelectors = [
    { selector: ".cookie", classInstance: Cookie },
    { selector: ".resume__choose", classInstance: ChooseTabs },
    { selector: ".resume__rubricks", classInstance: Rubricks },
    { selector: "#options", classInstance: Options },
];


function initInputs() {
    inittingSelectors.forEach(selectorData => {
        const selector = selectorData.selector;
        const classInstance = selectorData.classInstance;
        const notInittedNodes = Array.from(document.querySelectorAll(selector))
            .filter(node => {
                let isInitted = Boolean(
                    inittedInputs.find(inpClass => {
                        return inpClass.rootElem === node
                            && inpClass instanceof selectorData.classInstance
                    })
                );
                return isInitted ? false : true;
            });

        notInittedNodes.forEach(inittingNode => {
            inittedInputs.push(new classInstance(inittingNode));
        });
    });
}

const inittingInputsBodyObserver = new MutationObserver(() => {
    initInputs();
});
inittingInputsBodyObserver.observe(document.body, { childList: true, subtree: true });
initInputs();

/* ========================================= ПОЛЯ INPUT ========================================= */

class Input {
    constructor(node) {
        this.onInput = this.onInput.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onChange = this.onChange.bind(this);
        this.clear = this.clear.bind(this);
        this.onDocumentClick = this.onDocumentClick.bind(this);
        this.typeNumbersOnly = this.typeNumbersOnly.bind(this);

        this.rootElem = node;
        this.errorMessage = this.rootElem.querySelector(".work-error");
        this.clearButton = this.rootElem.querySelector(".cross");
        this.wrongValueMessageBlock = this.rootElem.querySelector(".text-input__wrong-value");

        document.addEventListener("click", this.onDocumentClick);
        this.clearButton.addEventListener("click", this.clear);
    }
    initInput() {
        this.input.addEventListener("input", this.onInput);
        this.input.addEventListener("focus", this.onFocus);
        this.input.addEventListener("change", this.onChange);
        this.input.addEventListener("blur", this.onChange);
    }
    onInput(event) {
        if (this.selectsWrap) this.highlitMatches();
        this.rootElem.classList.remove("__uncompleted");

        this.checkCompletion(event);
    }
    onFocus() {
        this.rootElem.classList.add("open-selects");
    }
    onChange() {
        const value = this.input.value;
        if (this.maskData) {
            const userValue = this.getClearedFromMaskValue(value);
            if (!userValue) this.input.value = "";
        }
        this.rootElem.classList.remove("__wrong-value");
        this.checkCompletion(event);
    }
    clear() {
        this.input.value = "";
        this.input.dispatchEvent(new Event("input"));
        this.input.dispatchEvent(new Event("change"));
    }
    onDocumentClick(event) {
        if (event.target === this.input) return;

        this.rootElem.classList.remove("open-selects");
    }
    typeNumbersOnly(event) {
        const input = event.target;
        const value = input.value;
        input.value = value.replace(/\D/g, "");
    }
}

class TextInput extends Input {
    constructor(node) {
        super(node);
        this.onMaskInput = this.onMaskInput.bind(this);
        this.wrapInMask = this.wrapInMask.bind(this);

        this.input = this.rootElem.querySelector(".text-input__input");
        this.mask = this.input.dataset.inputMask;
        this.completionMask = this.input.dataset.completionMask;
        this.isNumbersOnly = this.input.hasAttribute("data-numbers-only");

        this.getSelectsWrap();
        this.initInput();
        if (this.isNumbersOnly) this.input.addEventListener("input", this.typeNumbersOnly);
        if (this.mask) {
            this.createMask();
            this.input.addEventListener("input", this.onMaskInput);
        }
        if (this.wrongValueMessageBlock) {
            const removeButton = this.wrongValueMessageBlock.querySelector(".wrong-value__cross");
            removeButton.addEventListener("click", () => {
                this.rootElem.classList.remove("__wrong-value")
            });
        }
    }
    checkCompletion(event) {
        const value = this.input.value;

        if (this.mask) {
            const regexp = new RegExp(this.mask);
            this.isCompleted = Boolean(value.match(regexp));
        }
        if (this.completionMask) {
            const regexp = new RegExp(this.completionMask);
            this.isCompleted = Boolean(value.match(regexp));
        }

        const doSetUncompleteClass = !event || event && event.type !== "input";

        if (!this.isCompleted && value) {
            if (doSetUncompleteClass) this.rootElem.classList.add("__uncompleted");
            this.rootElem.classList.add("__wrong-value");
        }
        else {
            if (doSetUncompleteClass) this.rootElem.classList.remove("__uncompleted");
            this.rootElem.classList.remove("__wrong-value");
        }
    }
    getSelectsWrap() {
        this.selectsWrap = this.rootElem.querySelector(".selects-wrap");
        if (this.selectsWrap) {
            this.selectValues = Array.from(this.selectsWrap.querySelectorAll(".selects-wrap__option"));
            this.selectValues = this.selectValues.map(selVal => {
                return { node: selVal, text: selVal.textContent || val.innerText };
            });
            this.selectValues.forEach(selVal => {
                selVal.node.addEventListener("click", () => {
                    this.input.value = selVal.text;
                    this.input.dispatchEvent(new Event("input"));
                });
            });
        }
    }
    highlitMatches() {
        const value = this.input.value.toLowerCase().trim();
        const fullMatch = this.selectValues.find(selVal => {
            return selVal.text.toLowerCase().trim() === value;
        });
        if (fullMatch) {
            this.selectValues.forEach(selVal => {
                selVal.node.classList.remove("none");
                selVal.node.innerHTML = selVal.text;
            });
        } else {
            this.selectValues.forEach(val => {
                const valText = val.text;
                const valTextMod = valText.toLowerCase().trim();
                if (valTextMod.includes(value)) {
                    val.node.classList.remove("none");
                    const substrPos = valTextMod.indexOf(value);
                    const substrEnd = substrPos + value.length;
                    let substr = valText.slice(0, substrPos)
                        + `<span class="highlight">${valText.slice(substrPos, substrEnd)}</span>`
                        + valText.slice(substrEnd);

                    val.node.innerHTML = substr;
                } else val.node.classList.add("none");
            });
        }
    }
    createMask() {
        const regexp = new RegExp(this.mask);
        let parts = this.mask.split(/(\s)/);
        if (parts.length === 1) parts = this.mask.split(/(\.+)/);

        const regexps = parts.map(el => new RegExp(el));
        const substrings = parts.map(el => el.replace("\\", ""));
        const unspacedMask = substrings.join("");

        this.maskData = { regexps, substrings, unspacedMask };
    }
    onMaskInput(event) {
        if (event.inputType && event.inputType.includes("deleteContent")) return;
        const value = this.input.value;
        if (event.inputType === "insertFromPaste") {
            setTimeout(() => {
                let clearValue = this.getClearedFromMaskValue(value);
                if (this.isNumbersOnly) clearValue = clearValue.replace(/[^0-9+()\s-]/g, "");
                this.wrapInMask(clearValue);
            }, 100);
            return;
        }

        let shift = 0;
        for (let i = 0; i < this.maskData.regexps.length; i++) {
            const exp = this.maskData.regexps[i];
            const length = this.maskData.substrings[i].length;
            const substr = value.slice(shift, shift + length);
            shift += length;

            if (substr && !substr.match(exp)) {
                let clearValue = this.getClearedFromMaskValue(value);
                this.wrapInMask(clearValue);
                break;
            }
        }
    }
    getClearedFromMaskValue(rawValue) {
        this.maskData.regexps.forEach((rexp, i) => {
            const stringAnalog = this.maskData.substrings[i];
            if (stringAnalog.includes(".")) return;
            else rawValue = rawValue.replace(rexp, "");
        });
        return rawValue;
    }
    wrapInMask(clearValue) {
        let newValue = this.maskData.unspacedMask;
        clearValue.split("").forEach(letter => newValue = newValue.replace(".", letter));
        const sliceTo = newValue.includes(".") ? newValue.indexOf(".") : null;
        if (sliceTo) newValue = newValue.slice(0, sliceTo);
        this.input.value = newValue.replace("\\", "");
    }
}

class TextInputPhone extends TextInput {
    constructor(node) {
        super(node);
        this.mask = "\\+7 \\( ... \\) ... - .. - ..";
        this.createMask();
        this.input.addEventListener("focus", this.onMaskInput);
        this.input.addEventListener("input", this.onMaskInput);
    }
    typeNumbersOnly(event) {
        const input = event.target;
        const value = input.value;
        input.value = value.replace(/[^0-9+()\s-]/g, "");
        const plusIndex = value.lastIndexOf("+");
        if (plusIndex > 0)
            input.value = input.value.slice(0, plusIndex) + input.value.slice(plusIndex + 1);
    }
    onMaskInput(event) {
        if (event.type === "focus" && !this.input.value) this.input.value = "+7 (";
        if (event.inputType && event.inputType.includes("deleteContent")) {
            if (this.mask.startsWith("8") && this.input.value.length <= 5)
                this.input.value = "";
        }

        let value = this.input.value;
        const hasSpaces = this.mask.match(/\s/);
        let numPos = hasSpaces ? 6 : 4;
        const startsWithEight = value.endsWith("8") && value.length <= numPos
            || value.startsWith("8");
        const setSeven = value.startsWith("+7") && !this.mask.includes("+7") || !value;
        const setEightEighthundred = startsWithEight && this.mask.includes("+7");

        if (setEightEighthundred) {
            this.mask = "8 800 ... - .. - ..";
            this.createMask();
            this.input.setAttribute("maxlength", "19");
            if (this.input.value.includes("+7"))
                this.input.value = this.input.value.replace("+7", "").replace("(", "").replace(")", "");
        } else if (setSeven || this.mask.startsWith("8") && event.inputType && event.inputType.includes("deleteContent")) {
            this.mask = "\\+7 \\( ... \\) ... - .. - ..";
            this.createMask();
            this.input.setAttribute("maxlength", "24");
        }
        super.onMaskInput(event);

        if (this.mask.includes("+7") && value[5] == "7" || value[4] == "7") {
            this.input.value = this.input.value.slice(0, 5) + this.input.value.slice(6);
        }
    }
}

class TextInputCheckboxes extends Input {
    constructor(node) {
        super(node);
        this.apply = this.apply.bind(this);

        this.input = this.rootElem.querySelector(".selects-input-checkbox__input");
        this.applyButton = this.rootElem.querySelector(".selects-wrap-checkbox__button");
        this.checkboxesBlock = this.rootElem.querySelector(".selects-wrap-checkbox");
        this.checkboxes = Array.from(this.checkboxesBlock.querySelectorAll(".selects-checkbox"));
        this.checked = [];

        this.initInput();
        this.applyButton.addEventListener("click", this.apply);
    }
    checkCompletion() {

    }
    apply() {
        this.checked = this.checkboxes.filter(checkbox => checkbox.checked);
        if (this.checked.length < 1) this.input.value = "";
        if (this.checked.length === 1) this.input.value = this.checked[0].value;
        if (this.checked.length > 1) {
            this.input.value = "Выбрано: " + this.checked.length;
        }

        this.closeSelects();
    }
    onDocumentClick(event) {
        const isException = event.target === this.input
            || event.target === this.checkboxesBlock
            || event.target.closest(".selects-wrap-checkbox");
        if (isException) return;

        this.closeSelects();
    }
    closeSelects() {
        this.rootElem.classList.remove("open-selects");
        this.checkboxes.forEach(cb => {
            const isChecked = this.checked.includes(cb);
            if (isChecked) cb.checked = true;
            else cb.checked = false;
        });
    }
    clear() {
        this.checkboxes.forEach(cb => cb.checked = false);
        this.apply();
    }
}

class AddFieldButton {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        this.addData = this.rootElem.dataset.addField.split(", ");
        this.selector = this.addData[0];
        const maxFieldsAmount = parseInt(this.addData[1]);
        this.maxFieldsAmount = maxFieldsAmount > 0 ? maxFieldsAmount : 1;
        this.cloneRef = document.querySelector(this.selector);
        if (this.cloneRef.closest(".selects-item")) this.cloneRef = this.cloneRef.closest(".selects-item");

        this.counter = 2;
        this.addedFields = [];

        this.rootElem.addEventListener("click", this.onClick);
    }
    onClick() {
        this.addField();
    }
    addField() {
        if (this.addedFields.length > this.maxFieldsAmount) return;

        const field = this.cloneRef.cloneNode(true);
        this.replaceUniqueAttributes(field);
        const removeButton = this.createRemoveButton();
        field.append(removeButton);
        this.rootElem.before(field);
        this.addedFields.push(field);

        removeButton.addEventListener("click", () => this.removeField(field));

        if (this.addedFields.length >= this.maxFieldsAmount) this.rootElem.classList.add("none");
    }
    replaceUniqueAttributes(field, doSubtraction = false) {
        replaceAttr = replaceAttr.bind(this);

        field.querySelectorAll("[name]").forEach(f => replaceAttr(f, "name"));
        field.querySelectorAll("[id]").forEach(f => replaceAttr(f, "id"));
        field.querySelectorAll("label[for]").forEach(f => replaceAttr(f, "for"));

        this.counter++;

        function replaceAttr(node, attr) {
            const originValue = node.getAttribute(attr);
            if (!originValue) return;

            let newValue;
            // уменьшить счетчик на 1 (при удалении поля)
            if (doSubtraction) {
                let currentCounter = originValue.match(/\d+\b/);
                if (!currentCounter) return;
                const indexOfCounter = originValue.indexOf(currentCounter);
                currentCounter = parseInt(currentCounter[0]);
                if (currentCounter <= 0 || currentCounter == Infinity) return;

                let subtrCounter = currentCounter - 1;
                newValue = originValue.slice(0, indexOfCounter) + subtrCounter.toString();
            }
            // выставить счетчик (при добавлении поля)
            else {
                newValue = originValue.trim().replace(/\d\b/, "").replace(/\-\b/, "")
                    + "-" + this.counter.toString();
            }

            node.setAttribute(attr, newValue);
        }
    }
    createRemoveButton() {
        const removeButtonLayout = `
            <span class="add__plus-wrap mr-10"> 
                <span class="add__plus">_</span>
            </span>
            <span class="add__text">Удалить</span>
        `;
        const removeButton =
            createElement("button", "add__button remove first-minus remove-field", removeButtonLayout);
        removeButton.setAttribute("type", "button");

        return removeButton;
    }
    removeField(field) {
        const index = this.addedFields.indexOf(field);
        const nextFields = this.addedFields.filter((f, i) => i > index);
        // вычесть "1" из всех последующих за удаляемым полей
        nextFields.forEach(nextF => this.replaceUniqueAttributes(nextF, true));
        this.addedFields.splice(index, 1);
        field.remove();
        this.counter--;
        if (this.addedFields.length < this.maxFieldsAmount) this.rootElem.classList.remove("none");
    }
}

let inputsInittingSelectors = [
    { selector: ".text-input--standard", classInstance: TextInput },
    { selector: ".text-input--phone", classInstance: TextInputPhone },
    { selector: "[data-add-field]", classInstance: AddFieldButton },
    { selector: ".selects-input-checkbox", classInstance: TextInputCheckboxes },
];
inittingSelectors = inittingSelectors.concat(inputsInittingSelectors);