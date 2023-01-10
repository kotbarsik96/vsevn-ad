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

class Cookie {
    constructor(node) {
        this.onOkClick = this.onOkClick.bind(this);
        this.onLearnMoreClick = this.onLearnMoreClick.bind(this);

        this.rootElem = node;
        this.okButton = this.rootElem.querySelector(".cookie__button--ok");
        this.learnMoreButton = this.rootElem.querySelector(".cookie__link--learn-more");

        this.okButton.addEventListener("click", this.onOkClick);
        this.learnMoreButton.addEventListener("click", this.onLearnMoreClick);
    }
    onOkClick() {
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

class TextInput {
    constructor(node) {
        this.onInput = this.onInput.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.clear = this.clear.bind(this);

        this.rootElem = node;
        this.input = this.rootElem.querySelector(".text-input__input");
        this.clearButton = this.rootElem.querySelector(".cross");

        this.getSelectsWrap();
        this.input.addEventListener("input", this.onInput);
        this.input.addEventListener("focus", this.onFocus);
        this.input.addEventListener("blur", this.onBlur);
        this.clearButton.addEventListener("click", this.clear);
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
    onInput(event) {
        if (this.selectsWrap) this.highlitMatches();
    }
    onBlur() {
        setTimeout(() => {
            this.rootElem.classList.remove("open-selects");
        }, 100);
    }
    onFocus() {
        this.rootElem.classList.add("open-selects");
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
    clear() {
        this.input.value = "";
        this.input.dispatchEvent(new Event("input"));
    }
}

let inputsInittingSelectors = [
    { selector: ".text-input", classInstance: TextInput },
];
inittingSelectors = inittingSelectors.concat(inputsInittingSelectors);