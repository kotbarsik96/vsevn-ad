/* ========================================= ОБЩИЕ СКРИПТЫ ========================================= */
let inittedInputs = [];

// определить браузер
function getBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    let browser = [
        userAgent.match(/chrome/),
        userAgent.match(/opera/),
        userAgent.match(/safari/),
        userAgent.match(/firefox/)
    ].find(br => br);
    if (browser) browser = browser[0];

    return browser;
}

const browser = getBrowser();

function browsersFix() {
    if (browser !== "firefox" && browser !== "safari") {
        let addFixClass = [];

        addFixClass.forEach(el => {
            el.classList.add("__chromium-fix");
        });
    }
    if (browser === "firefox") {
        let addMozfixClass = [];
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll("input")));
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".checkboxes-wrap")));
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".checkboxes__items_item--flex .text-input")));
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".time-schedule__button")));
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".radio-wrap__items .big-text")));
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".radio-wrap__items label")));
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".tags-list")));
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".res-vac-preview__to-favorites")));

        addMozfixClass.forEach(el => {
            el.classList.add("__moz-fix");
        });
    }
}
browsersFix();

function capitalize(string) {
    const arr = string.split("");
    arr[0] = arr[0].toUpperCase();
    return arr.join("");
}

function fetchMapData(query) {
    return new Promise((resolve, reject) => {
        let url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
        let token = "773da684df214d0f16e283aeccb68fbf99198ee5";
        let count = 20;

        let options = {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Token " + token
            },

            body: JSON.stringify({ query, count })
        }

        fetch(url, options)
            .then(response => response.text())
            .then(result => {
                const json = JSON.parse(result);
                resolve(json);
            })
            .catch(error => reject(error));
    });
}

function assignPropertiesToObj(propertiesArray, obj = {}, delimeter = ":") {
    propertiesArray.forEach(str => {
        const property = str.split(delimeter);
        const key = property[0];
        const value = property[1];
        obj[key] = value;
    });

    return obj;
}

function getCoords(el) {
    const box = el.getBoundingClientRect();
    return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset
    }
}

function calcSize(bytes) {
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb < 1) return `${parseInt(kb)} кб`;
    if (mb >= 1) return `${parseInt(mb * 100) / 100} мб`;
}

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

function findInittedInputByFlag(instanceFlag, isAll = false) {
    // isAll == true: вернет array, isAll == false: вернет первый найденный по флагу элемент
    if (isAll) {
        const inputs = inittedInputs.filter(arrayHandler);
        return inputs;
    } else {
        const input = inittedInputs.find(arrayHandler);
        return input;
    }

    function arrayHandler(inpClass) {
        let matches = inpClass.instanceFlag === instanceFlag;
        return matches;
    }
}

function createElement(tagName, className, insertingHTML) {
    let element = document.createElement(tagName);
    if (className) element.className = className;
    if (insertingHTML) element.insertAdjacentHTML("afterbegin", insertingHTML);
    return element;
}

// найдет ближайший к relative элемент (потомок, сосед, родитель)
function findClosest(relative, selector) {
    let closest = relative.querySelector(selector);
    let parentNode = relative;
    while (!closest && parentNode !== document.body) {
        parentNode = parentNode.parentNode;
        if (!parentNode) break;
        closest = parentNode.querySelector(selector);
    }
    return closest;
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
        this.tabs = Array.from(this.rootElem.querySelectorAll("[data-tab-name]"));

        this.tabs.forEach(tab => tab.addEventListener("click", this.tabChange));
        this.tabNames = this.tabs.map(tab => { return { tab, tabName: tab.dataset.tabName } });
    }
    tabChange(event) {
        const tab = event.currentTarget;
        const tabName = this.tabNames.find(t => t.tab === tab).tabName;
        this.tabs.forEach(otherTab => {
            if (otherTab !== tab) otherTab.classList.remove("active");
            tab.classList.add("active");
        });
        let rubrick = findInittedInput(".resume__rubricks");
        const options = findInittedInput("#options");
        const footer = document.querySelector("footer.footer");
        const arrowTip = document.querySelector(".page__resume-arrow-tip");
        rubrick.show();
        options.show();
        options.setRubricks();
        footer.classList.remove("none");
        if (arrowTip) arrowTip.remove();

        let status = "";
        switch (tabName) {
            case "applicant": status = "соискатель";
            default:
                break;
            case "employer": status = "работодатель";
                break;
        }
        rubrick.setStatus(status);
        this.status = status;
        this.tabName = tabName;
        this.rootElem.dispatchEvent(
            new CustomEvent("change-tab", { detail: { status, name: tabName || applicant } })
        );
    }
}

class Rubricks {
    constructor(node) {
        this.onChange = this.onChange.bind(this);
        this.scrollToPreferences = this.scrollToPreferences.bind(this);

        this.rootElem = node;
        this.limit = 3;
        this.statusSpan = this.rootElem.querySelector(".rubricks__status");
        this.toPreferencesButton = this.rootElem.querySelector(".rubricks__jobs-button");
        this.checkboxesItems = Array.from(
            document.querySelectorAll(`[name="rubrick-checkbox"]`)
        );
        this.checkboxesItems.forEach(cb => {
            cb.addEventListener("change", this.onChange);
            setTimeout(() => cb.dispatchEvent(new Event("change")), 0);
        });

        this.toPreferencesButton.addEventListener("click", this.scrollToPreferences);
    }
    show() {
        this.rootElem.classList.remove("none");
    }
    onChange(event) {
        const targInput = event.target;
        if (!Array.isArray(this.checked)) this.checked = [];
        const options = findInittedInput("#options");

        forbidPassCheckLimit.call(this);
        options.setRubricks();

        this.checkboxesItems = Array.from(
            document.querySelectorAll(`[name="rubrick-checkbox"]`)
        );

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
    }
    setStatus(status) {
        this.statusSpan.innerHTML = "";
        this.statusSpan.insertAdjacentText("afterbegin", status);
    }
    scrollToPreferences() {
        const preferencesBlock = document.querySelector("#preferences");
        if (!preferencesBlock) return;
        const windowHeight = document.documentElement.clientHeight || window.innerHeight;
        const top = getCoords(preferencesBlock).top - windowHeight * 0.25;

        window.scrollTo({
            behavior: "smooth",
            top
        });
    }
}

class StatusDependable {
    constructor(node) {
        this.setState = this.setState.bind(this);

        this.rootElem = node;
        findInittedInput(".resume__choose").rootElem
            .addEventListener("change-tab", this.setState);
    }
    setState(event) {
        const detail = event.detail;
        return detail;
    }
}

class StatusDependableText extends StatusDependable {
    constructor(node) {
        super(node);

        this.getStatuses();
        this.getProperties();
    }
    getProperties() {
        let properties = this.rootElem.dataset.statusDependableAttrs;
        this.rootElem.removeAttribute("data-status-dependable-attrs");
        if (!properties) {
            this.changeableProperties = ["innerHTML"];
            return;
        }

        this.changeableProperties = properties.split(", ");
    }
    getStatuses() {
        const statuses = this.rootElem.dataset.statusDependableText.split(" || ");
        this.data = assignPropertiesToObj(statuses, {}, "::");
        this.rootElem.removeAttribute("data-status-dependable-text");
    }
    setState(event) {
        const name = super.setState(event).name;

        this.changeableProperties.forEach(property => {
            this.rootElem[property] = this.data[name] || "";
        });
    }
}

class StatusDependableDisplay extends StatusDependable {
    constructor(node) {
        super(node);

        this.conditionTabs = this.rootElem.dataset.statusDependableDisplay.split(", ");
        this.anchor = createElement("div", "none");
        this.rootElem.removeAttribute("data-status-dependable-display");

        setTimeout(() => this.setState(), 0);
    }
    setState(event = null) {
        let name;
        if (!event) {
            name = findInittedInput(".resume__choose").tabName;
        }
        else name = super.setState(event).name;
        if (this.conditionTabs.includes(name)) {
            if (this.rootElem.closest("body")) return;

            this.anchor.replaceWith(this.rootElem);
        } else this.rootElem.replaceWith(this.anchor);
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
        // перечисление рубрик обычным списком
        const blocks = this.rootElem.querySelectorAll(".rubricks-categories");
        const checkedRubricks = findInittedInput(".resume__rubricks").checked || [];
        blocks.forEach(block => {
            const blockSpan = block.querySelector("span");

            let blockSpanInner = "";
            checkedRubricks.forEach((inp, i, arr) => {
                blockSpanInner += inp.value;
                if (i != arr.length - 1) blockSpanInner += ", ";
            });
            if (checkedRubricks.length < 1) blockSpanInner = `
                <span class="red">Не выбрано ни одной рубрики. Пожалуйста, выберите одну или несколько рубрик</span>
            `;
            blockSpan.innerHTML = blockSpanInner;
        });

        // дублирование чекбоксов рубрик в блоки
        const checkboxLabels = document.querySelectorAll(".rubricks-checkboxes");
        checkboxLabels.forEach(cbLabel => {
            let blockInner = "";
            checkedRubricks.forEach((inp) => {
                blockInner += `
                    <div class="flex rubricks-item">
                        <span class="rubricks-item__text">${inp.value}</span>
                        <button class="icomoon-pencil rubricks-item__edit rubricks-item__icon" data-hover-title="Редактировать" type="button"></button>
                        <button class="icomoon-cross rubricks-item__remove rubricks-item__icon" data-hover-title="Удалить" type="button"></button>
                    </div>
                `;
            });
            if (checkedRubricks.length < 1) {
                blockInner = `
                <span class="big-text red">Не выбрано ни одной рубрики. Пожалуйста, выберите одну или несколько рубрик</span>
                `;
            }
            cbLabel.innerHTML = blockInner;

            cbLabel.querySelectorAll(".rubricks-item")
                .forEach(cbl => {
                    const editBtn = cbl.querySelector(".rubricks-item__edit");
                    const removeBtn = cbl.querySelector(".rubricks-item__remove");

                    editBtn.addEventListener("click", onEditClick);
                    removeBtn.addEventListener("click", onRemoveClick);

                    function getOrigCb(cbLabel) {
                        const text = cbLabel
                            .closest(".rubricks-item")
                            .querySelector(".rubricks-item__text").innerHTML.trim();

                        const origCb = findInittedInput(".resume__rubricks")
                            .checkboxesItems.find(cb => {
                                const cbText = cb.parentNode.querySelector(".text").innerHTML.trim();
                                return cbText === text;
                            });
                        return origCb;
                    }
                    function onEditClick(event) {
                        const cbLabel = event.target;
                        const origCb = getOrigCb(cbLabel);
                        origCb.closest(".checkboxes__items_item").scrollIntoView({ behavior: "smooth" });
                    }
                    function onRemoveClick(event) {
                        const cbLabel = event.target;
                        const origCb = getOrigCb(cbLabel);
                        origCb.checked = false;
                        origCb.dispatchEvent(new Event("change"));
                    }
                });
        });

        // выставить правильный текст в кнопках, ведущих скролл к блоку рубрик
        const scrollToRubricksButtons = document.querySelectorAll(".add__button--rubrick");
        const scrollToRubricksButtonsText = checkedRubricks.length > 0
            ? "Добавить еще рубрику"
            : "Добавить рубрику";
        scrollToRubricksButtons.forEach(btn => {
            const text = btn.querySelector(".add__text");
            text.innerHTML = "";
            text.insertAdjacentText("afterbegin", scrollToRubricksButtonsText);
        });
    }
}

class PromotionAbout {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        this.text = this.rootElem.dataset.promotionAbout;
        this.promotionOpenBlock = this.rootElem.querySelector(".promotion-item__tip-modal");

        this.rootElem.addEventListener("click", this.onClick);
        if (this.promotionOpenBlock)
            this.promotionOpenBlock.insertAdjacentText("afterbegin", this.text);
        this.rootElem.removeAttribute("data-promotion-about");
    }
    onClick(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.popup) this.createPopup();
        this.popup.init();
    }
    createPopup() {
        const popupInner = `<p class="popup__text">${this.text}</p>`;
        this.popup = new Popup({ popupInner });
        this.popup.rootElem.classList.add("popup--text");
    }
}

class Popup {
    constructor(data = {}) {
        this.defineAlignment = this.defineAlignment.bind(this);

        // data = { popupInner = "htmlString", popupClassName: "string", transitionDuration: number }. Если указан data.transitionDuration и data-transition-duration, приоритет имеет атрибут.
        this.onPopupClick = this.onPopupClick.bind(this);
        this.data = data;
        const popupInnerDefault = `
            <div class="popup__body">
                <div class="popup__cross"></div>
            </div>`;
        this.rootElem = createElement("div", "popup", popupInnerDefault);
        this.popupBody = this.rootElem.querySelector(".popup__body");
        if (data.popupInner) this.popupBody.insertAdjacentHTML("beforeend", data.popupInner);
        const transitionDurationDataset = this.rootElem.dataset.transitionDuration;
        if (transitionDurationDataset) this.transitionDuration =
            parseInt(transitionDurationDataset.replace(/\D/g, ""));

        else this.transitionDuration = data.transitionDuration || 400;
        this.rootElem.style.transitionDuration = `${this.transitionDuration / 1000}s`;
        this.popupBody.style.transitionDuration = `${this.transitionDuration / 1000}s`;
        this.setStyles("remove");

        // с задержкой, т.к. если поставить обработчик сразу, на мобильном экране сразу будет сделан клик
        setTimeout(() => this.rootElem.addEventListener("click", this.onPopupClick), 100);
    }
    onPopupClick(event) {
        const isTarget = event.target.classList.contains("popup")
            || event.target.classList.contains("popup__cross")
            || event.target.closest(".popup__cross");
        if (isTarget) this.remove();
    }
    setStyles(action) {
        switch (action) {
            case "show":
                this.rootElem.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                this.popupBody.style.transform = "perspective(600px) translate(0, 0) rotateX(0)";
                break;
            case "remove":
                this.rootElem.style.backgroundColor = "rgba(0, 0, 0, 0)";
                this.popupBody.style.transform =
                    "perspective(600px) translate(0, -60vh) rotateX(45deg)";
                break;
        }
    }
    init(isInvisible = false) {
        return new Promise(resolve => {
            if (isInvisible) this.rootElem.classList.add("none");
            document.querySelector(".wrapper").append(this.rootElem);
            document.body.classList.add("__locked-scroll");
            setTimeout(() => {
                this.inputsParams = inittedInputs.filter(inpParams => {
                    return inpParams.rootElem.closest(".popup") === this.rootElem;
                });
                this.rootElem.addEventListener("transitionend", this.defineAlignment);
                window.addEventListener("resize", this.defineAlignment);
                resolve(this.inputsParams);
            }, 0);
            setTimeout(() => this.setStyles("show"), 50);
        });
    }
    remove() {
        this.setStyles("remove");
        document.body.classList.remove("__locked-scroll");
        window.removeEventListener("resize", this.defineAlignment);
        setTimeout(() => {
            this.rootElem.remove();
            this.rootElem.classList.remove("none");
            this.rootElem.dispatchEvent(new CustomEvent("popup-remove"));
        }, this.transitionDuration);
    }
    defineAlignment() {
        this.rootElem.removeEventListener("transitionend", this.defineAlignment);
        const windowHeight = document.documentElement.clientHeight || window.innerHeight;
        const popupHeight = this.rootElem.querySelector(".popup__body").offsetHeight;

        if (popupHeight > windowHeight - (windowHeight * 0.1)) {
            this.rootElem.classList.add("popup--high");
        } else {
            this.rootElem.classList.remove("popup--high");
        }
    }
}

class PromotionBlock {
    constructor(node) {
        this.onOptionChange = this.onOptionChange.bind(this);

        this.rootElem = node;
        this.rootElem.addEventListener("click", this.onClick);
        this.options = Array.from(this.rootElem.querySelectorAll("[data-promotion-option]"))
            .map(option => {
                let options = option.dataset.promotionOption;
                if (!options.includes("changeable")) option.removeAttribute("data-promotion-option");
                if (!options) return null;

                options = options.split(", ");
                const price = parseInt(options[0].split("|")[0]);
                const oldPrice = parseInt(options[0].split("|")[1]) || 0;
                const discount = oldPrice ? 100 - price / (oldPrice / 100) : false;
                const input = option.querySelector("input[type='radio']")
                    || option.querySelector("input[type='checkbox']");
                const changeableInput = input.closest(".promotion-item")
                    .querySelector(".promotion-item__amount-input");
                const changeable = options[1] === "changeable"
                    ? { input: changeableInput }
                    : false;

                option.addEventListener("click", () => {
                    const type = input.getAttribute("type");
                    if (type === "radio" && input.checked) return;

                    if (type === "checkbox" && input.checked) input.checked = false;
                    else input.checked = true;

                    const allInputs =
                        document.querySelectorAll(`[name="${input.getAttribute("name")}"]`);
                    allInputs.forEach(inp => inp.dispatchEvent(new Event("change")));
                });

                return {
                    option,
                    input,
                    price,
                    oldPrice,
                    discount,
                    changeable,
                }
            })
            .filter(opt => opt);

        this.options.forEach(optData => {
            const input = optData.input;
            if (input) input.addEventListener("change", this.onOptionChange);
        });
        this.totalPriceBlock = this.rootElem.querySelector(".total");

        this.handleBonus();
        this.handleCodeWords();
        this.onOptionChange();
        this.toggleCodeWordsBlock();
        this.createPromotionMore();
    }
    handleBonus() {
        onBonusInput = onBonusInput.bind(this);
        onBonusChange = onBonusChange.bind(this);

        this.bonusNumberSpan = this.totalPriceBlock.querySelector(".bouns-number");
        if (this.bonusNumberSpan) this.bonusNumber = parseInt(
            this.bonusNumberSpan.textContent.replace(/\D/g, "")
            || this.bonusNumber.innerText.replace(/\D/g, "")
        );
        else this.bonusNumber = 1000;

        this.bonusInput = this.rootElem.querySelector("#total-input");
        this.bonusInput.addEventListener("input", onBonusInput);
        this.bonusInput.addEventListener("change", onBonusChange);

        function onBonusInput() {
            this.bonusInput.value = "-" + this.bonusInput.value.replace(/\D/g, "");
            const value = parseInt(this.bonusInput.value.replace(/-/g, ""));
            if (value > 0) {
                if (value > this.bonusNumber) this.bonusInput.value = "-" + this.bonusNumber;
            } else if (value == NaN) this.input.value = "";
        }
        function onBonusChange() {
            const value = parseInt(this.bonusInput.value.replace(/-/g, "")) || 0;
            if (value > this.totalPrice) this.bonusInput.value = "-" + this.totalPrice;
            this.calcTotalPrice();
        }
    }
    onOptionChange() {
        this.checkedOptions = this.options.filter(optData => optData.input.checked);
        this.calcTotalPrice();
        this.toggleCodeWordsBlock();
    }
    calcTotalPrice() {
        createOptionText = createOptionText.bind(this);

        this.totalPrice = 0;
        this.checkedOptions.forEach(optData => {
            if (optData.changeable) {
                const input = optData.input.closest(".promotion-item__input-button > input")
                    .querySelector(".promotion-item__amount-input");
                const amount = parseInt(input.value.replace(/\D/g, ""));
                this.totalPrice += optData.price * amount;
            }
            else this.totalPrice += optData.price;
        });

        // выставить подсчет цены ДО скидки по бонусам
        const totalBlockData = this.totalPriceBlock.querySelector(".total__data");
        totalBlockData.innerHTML = "";
        if (this.totalPrice > 0) {
            this.totalPriceBlock.classList.remove("none");
            this.checkedOptions.forEach(checkedOption => {
                totalBlockData.insertAdjacentHTML("beforeend", createOptionText(checkedOption));
            });
            totalBlockData.insertAdjacentHTML("beforeend", createOptionText());
        } else this.totalPriceBlock.classList.add("none");

        // выставить подсчет цены с учетом бонусов
        let bonusValue = parseInt(this.bonusInput.value.replace(/-/g, ""));
        if (!bonusValue) bonusValue = 0;

        let totalNumberWithBonus = this.totalPrice - bonusValue;
        if (totalNumberWithBonus < 0) totalNumberWithBonus = 0;

        const totalText = this.rootElem.querySelector(".total__item_calculated");
        if (totalText) {
            totalText.innerHTML = "";
            totalText.insertAdjacentText("afterbegin", totalNumberWithBonus + " р.");
        }

        function createOptionText(checkedOption = null) {
            let totalOptionPrice = this.totalPrice;
            if (checkedOption) {
                totalOptionPrice = checkedOption.changeable
                    ? checkedOption.price * checkedOption.changeable.input.value
                    : checkedOption.price;
            }
            const optionText = checkedOption
                ? `
                    ${checkedOption.input.value}
                    <span class="mr-5 ml-5">
                        ${checkedOption.oldPrice || checkedOption.price}
                    </span> 
                    р. 
                    ${checkedOption.discount ? `скидка ${checkedOption.discount}%` : ""}
                `
                : "ИТОГО:";

            return `
            <div class="total__item">
                <div class="total__item-title">
                    <div>${optionText}</div>
                </div>
                <div class="total__item-content">
                    <span class="total__item_total-item">
                        ${checkedOption ? totalOptionPrice : this.totalPrice}
                    </span>
                    р.
                </div>
            </div>
            `;
        }
    }
    toggleCodeWordsBlock() {
        this.codeWordsBlock = this.rootElem.querySelector(".page-promotion__codes");
        if (!this.totalPrice) return this.codeWordsBlock.classList.add("none");

        if (this.totalPrice > 0) this.codeWordsBlock.classList.remove("none");
    }
    handleCodeWords() {
        onCodeWordsSubmit = onCodeWordsSubmit.bind(this);
        onCodeWordsFocus = onCodeWordsFocus.bind(this);
        onCodeWordsBlur = onCodeWordsBlur.bind(this);
        onCodeWordsKeydown = onCodeWordsKeydown.bind(this);

        this.codeWordsInput = this.rootElem.querySelector(".promotion-code__input");
        const codeWordsInputWrapper = this.codeWordsInput.closest(".promotion-code__input-wrapper");
        const codeWordsButton = this.rootElem.querySelector(".promotion-code__button");
        const promotionCodeDown = this.rootElem.querySelector(".promotion-code__down");

        this.codeWordsInput.addEventListener("focus", onCodeWordsFocus);
        this.codeWordsInput.addEventListener("blur", onCodeWordsBlur);
        this.codeWordsInput.addEventListener("keydown", onCodeWordsKeydown);
        codeWordsButton.addEventListener("click", onCodeWordsSubmit);

        onCodeWordsBlur();

        function onCodeWordsKeydown(event) {
            if (event.key === "Enter") onCodeWordsSubmit();
        }
        function onCodeWordsFocus() {
            codeWordsInputWrapper.classList.add("__focus");
        }
        function onCodeWordsBlur() {
            const value = this.codeWordsInput.value;
            codeWordsInputWrapper.classList.remove("__focus");
            if (!value) {
                codeWordsInputWrapper.classList.remove("__inserted-code");
                codeWordsInputWrapper.classList.add("__empty");
            } else codeWordsInputWrapper.classList.remove("__empty");
        }
        function onCodeWordsSubmit() {
            const value = this.codeWordsInput.value;
            switch (value) {
                default: codeWordsInputWrapper.classList.remove("__inserted-code");
                    codeWordsInputWrapper.classList.remove("__valid");
                    changePromotionCodeDown("");
                    break;
                case "vsevn1":
                    codeWordsInputWrapper.classList.add("__inserted-code");
                    codeWordsInputWrapper.classList.remove("__valid");
                    changePromotionCodeDown("Извините, срок этой акции истек (до 17.01.2023)");
                    break;
                case "vsevn2":
                    codeWordsInputWrapper.classList.add("__inserted-code");
                    codeWordsInputWrapper.classList.remove("__valid");
                    changePromotionCodeDown("К сожалению, Вы не можете активировать это кодовое слово, так как не являетесь участником акции");
                    break;
                case "vsevn3":
                    codeWordsInputWrapper.classList.add("__inserted-code");
                    codeWordsInputWrapper.classList.add("__valid");
                    changePromotionCodeDown("Кодовое слово принято!");
                    break;
                case "vsevn4":
                    codeWordsInputWrapper.classList.add("__inserted-code");
                    codeWordsInputWrapper.classList.remove("__valid");
                    changePromotionCodeDown("Вы уже активировали это слово ранее. Акция для вас уже активировна, наслаждайтесь покупками.");
                    break;
            }
        }
        function changePromotionCodeDown(text) {
            promotionCodeDown.innerHTML = "";
            promotionCodeDown.insertAdjacentHTML("afterbegin", text);
            if (text.includes("Кодовое слово принято!")) promotionCodeDown.classList.add("green");
            else promotionCodeDown.classList.remove("green");
        }
    }
    createPromotionMore() {
        this.options.forEach(optData => {
            const moreBlock = optData.option.querySelector(".promotion-more");
            if (!moreBlock) return;
            moreBlock.innerHTML = "";

            const innerhtml = `
                <button class="promotion-more__button" type="button">Показать больше</button>
                <ul class="promotion-more__list none"></ul>
            `;
            moreBlock.insertAdjacentHTML("afterbegin", innerhtml);
            const ul = moreBlock.querySelector(".promotion-more__list");
            const button = moreBlock.querySelector(".promotion-more__button");
            button.addEventListener("click", togglePromotion);

            const header = findClosest(optData.option, ".page-promotion__header");
            const headerTitles = header.querySelectorAll(".promotion-item__description-text");
            let ulInner = "";
            headerTitles.forEach(hTitle => ulInner += createLi(hTitle.innerHTML));
            ul.insertAdjacentHTML("afterbegin", ulInner);

            const ulItems = ul.querySelectorAll(".promotion-more__item");
            const descriptions = optData.option.querySelectorAll(".promotion-item__description-text");
            ulItems.forEach((ulItem, index) => {
                const descr = descriptions[index];
                const itemValue = ulItem.querySelector(".promotion-more__item-value");
                itemValue.insertAdjacentHTML("afterbegin", descr.innerHTML);
            });
        });
        document.addEventListener("click", (event) => {
            if (event.target.closest(".promotion-more")) return;

            document.querySelectorAll(".promotion-more__list")
                .forEach(ulList => ulList.classList.add("none"));
        });


        function togglePromotion(event) {
            event.stopPropagation();
            event.preventDefault();
            const targ = event.target;
            const list = findClosest(targ, ".promotion-more__list");
            list.classList.toggle("none");
        }
        function createLi(innerhtml) {
            return `
            <li class="promotion-more__item">
                <div class="promotion-more__item-title">
                    ${innerhtml}
                </div>
                <div class="promotion-more__item-value"></div>
            </li>
            `;
        }
    }
}

class ChangeablePricePromotion {
    constructor(node) {
        this.onInput = this.onInput.bind(this);
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        const options = this.rootElem.dataset.promotionOption.split(", ");
        const prices = options[0].split("|").map(p => parseInt(p.replace(/\D/g, "")));
        this.price = prices[0];
        this.oldPrice = prices[1];
        this.rootElem.removeAttribute("data-promotion-option");
        this.input = this.rootElem.querySelector(".promotion-item__amount-input");
        this.buttonPlus = this.rootElem.querySelector(".page-promotion__amount-plus");
        this.buttonMinus = this.rootElem.querySelector(".page-promotion__amount-minus");
        this.min = this.input.getAttribute("min");
        this.max = this.input.getAttribute("max");
        this.totalBlock = this.rootElem.querySelector(".page-promotion__checkbox-total");

        this.input.addEventListener("input", this.onInput);
        this.input.addEventListener("change", this.onChange);
        this.buttonPlus.addEventListener("click", () => this.mathOperation("+"));
        this.buttonMinus.addEventListener("click", () => this.mathOperation("-"));
    }
    getValue() {
        const value = this.input.value;
        return parseInt(value.replace(/\D/g, ""));
    }
    setTotal() {
        const totalValue = parseInt(this.input.value) * this.price;
        this.totalBlock.innerHTML = "";
        this.totalBlock.insertAdjacentText("afterbegin", totalValue);
    }
    mathOperation(operationSign = "+") {
        const value = this.getValue();
        if (operationSign === "+") {
            const newValue = value + 1;
            if (newValue > this.max) return;
            this.input.value = newValue;
        }
        if (operationSign === "-") {
            const newValue = value - 1;
            if (newValue < this.min) return;
            this.input.value = newValue;
        }
        this.input.dispatchEvent(new Event("change"));
    }
    onInput() {
        let value = parseInt(this.input.value.replace(/\D/g, ""));
        if (value > this.max) this.input.value = this.max;
        if (value < this.min) this.input.value = this.min;
        if (!value) this.input.value = this.min;

        let promotionBlockParams = findInittedInput("#promotion");
        promotionBlockParams.calcTotalPrice();
        this.setTotal();
    }
    onChange() {
        let promotionBlockParams = findInittedInput("#promotion");
        promotionBlockParams.calcTotalPrice();
        this.setTotal();
    }
}

class Spoiler {
    constructor(node) {
        this.toggle = this.toggle.bind(this);

        this.rootElem = node;
        this.spoilerButton = this.rootElem.querySelector(".spoiler__button");
        this.spoilerHideable = this.rootElem.querySelector(".spoiler__hideable");

        this.spoilerButton.addEventListener("click", this.toggle);
        if (this.rootElem.classList.contains("spoiler--shown")) this.show();
        else this.hide();
    }
    toggle() {
        this.rootElem.classList.contains("spoiler--shown")
            ? this.hide()
            : this.show();
    }
    show() {
        let height = this.getHeight();
        this.spoilerHideable.style.cssText = `
            max-height: ${height}px;
            opacity: 1;
        `;
        this.spoilerHideable.style.removeProperty("padding");
        this.spoilerHideable.style.removeProperty("margin");
        this.rootElem.classList.add("spoiler--shown");
    }
    hide() {
        this.spoilerHideable.style.cssText = `
            padding: 0;
            margin: 0;
            opacity: 0;
            max-height: 0px;
        `;
        this.rootElem.classList.remove("spoiler--shown");
    }
    getHeight() {
        let clone = this.spoilerHideable.cloneNode(true);
        clone.style.cssText = "position: absolute; z-index: -99; top: -100vh; left: -100vw;";
        document.body.append(clone);
        let height = clone.offsetHeight;
        clone.remove();
        return height + 10;
    }
}

class HoverTitle {
    constructor(node) {
        this.onPointerover = this.onPointerover.bind(this);
        this.onPointerleave = this.onPointerleave.bind(this);

        this.rootElem = node;
        this.text = this.rootElem.getAttribute("data-hover-title");
        this.block = createElement("span", "hover-title", this.text);

        this.rootElem.addEventListener("pointerover", this.onPointerover);
        this.rootElem.addEventListener("pointerleave", this.onPointerleave);
    }
    onPointerover() {
        this.rootElem.append(this.block);
    }
    onPointerleave() {
        this.block.remove();
    }
}

class StarRating {
    constructor(node) {
        this.onMouseover = this.onMouseover.bind(this);
        this.onMouseleave = this.onMouseleave.bind(this);
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        const params = this.rootElem.dataset.params || "";
        const properties = params.split("; ");
        this.params = assignPropertiesToObj(properties);
        this.emptyContainer = this.rootElem.querySelector(".star-rating__empty");
        this.fillContainer = this.rootElem.querySelector(".star-rating__fill");

        this.createStars();
        this.emptyStars = Array.from(this.emptyContainer.querySelectorAll(".star-rating__star-empty"));
        this.emptyStars.forEach(star => {
            star.addEventListener("mouseover", this.onMouseover);
            star.addEventListener("mouseleave", this.onMouseleave);
            star.addEventListener("click", this.onClick);
        });
        this.setFilledWidth();
    }
    createStars() {
        const starsAmount = Math.abs(parseInt(this.params.starsAmount)) || 5;
        for (let i = 0; i < starsAmount; i++) {
            const emptyStar = createElement("div", "star-rating__star-empty icomoon-star");
            const fillStar = createElement("div", "star-rating__star-fill icomoon-star-fill");

            this.emptyContainer.append(emptyStar);
            this.fillContainer.append(fillStar);
        }
    }
    setFilledWidth(starsAmount = 4) {
        const percent = starsAmount / (this.emptyStars.length / 100);
        this.fillContainer.style.width = `${percent}%`;
    }
    onMouseover(event) {
        const target = event.target;
        const index = this.emptyStars.indexOf(target) + 1;
        if (index < 1) return;

        this.setFilledWidth(index);

        return index;
    }
    onMouseleave() {
        const stars = this.userStars || this.params.initialStars || 4;
        this.setFilledWidth(stars);
    }
    onClick(event) {
        const index = this.onMouseover(event);
        this.userStars = index;
    }
}

class ResumeVacancyPreview {
    constructor(node) {
        this.onInputChange = this.onInputChange.bind(this);

        this.rootElem = node;
        this.infoBlocks = {
            adTitle: {
                el: this.rootElem.querySelector(".res-vac-preview__title"),
                default: "Менеджер по продаже строительных материалов"
            },
            userName: {
                el: this.rootElem.querySelector(".res-vac-preview__author"),
                default: "Александров Игорь Николаевич"
            },
            locationAndDate: {
                el: this.rootElem.querySelector(".res-vac-preview__location"),
                default: "Нижний Новгород, 01.01.2023"
            },
            schedule: {
                el: this.rootElem.querySelector(".res-vac-preview__schedule")
            },
            salaryContainer: {
                el: this.rootElem.querySelector(".res-vac-preview__salary-container"),
                anchor: createElement("div", "none")
            },
            salary: {
                el: this.rootElem.querySelector(".res-vac-preview__salary")
            },
            photo: {
                el: this.rootElem.querySelector(".res-vac-preview__photo")
            },
            additionalDescription: {
                el: this.rootElem.querySelector(".res-vac-preview__description--additional"),
                anchor: createElement("div", "none")
            },
            quickMark: {
                el: createElement("span", "res-vac-preview__quick-mark", "СРОЧНО"),
                anchor: createElement("span", "none")
            }
        };
        this.inputs = {
            userName: document.querySelector("#user-name"),
            adTitle: document.querySelector("#ad-title"),
            region: document.querySelector("#region"),
            salary: document.querySelector("#salary")
        }
        this.date = this.getDate();

        for (let key in this.inputs) {
            const input = this.inputs[key];
            input.addEventListener("change", this.onInputChange);
        }

        this.initPromotionBlocks();
    }
    initPromotionBlocks() {
        onOptChange = onOptChange.bind(this);

        const promotionParams = findInittedInput("#promotion");
        if (!promotionParams) return;

        this.promotionOptions = promotionParams.options;
        this.promotionOptions.forEach((opt, index) => {
            opt.input.addEventListener("change", onOptChange);
            if (index === 1) {
                setTimeout(() => opt.input.dispatchEvent(new Event("change")), 0);
            }
        });

        function onOptChange() {
            const checkedOptions = this.promotionOptions.filter(opt => opt.input.checked)
                .map(opt => opt.input);
            const quickMark = this.infoBlocks.quickMark;
            const salaryContainer = this.infoBlocks.salaryContainer;
            const addDescr = this.infoBlocks.additionalDescription;

            if (findOpt("VIP-размещение")) {
                this.rootElem.classList.add("res-vac-preview--vip");

                if (!salaryContainer.el.closest("body"))
                    salaryContainer.anchor.replaceWith(salaryContainer.el);
            } else {
                this.rootElem.classList.remove("res-vac-preview--vip");
                quickMark.el.replaceWith(quickMark.anchor);
                salaryContainer.el.replaceWith(salaryContainer.anchor);
            }

            if (findOpt("Выделить XXL")) {
                this.rootElem.classList.add("res-vac-preview--xxl");
                if (!addDescr.el.closest("body")) addDescr.anchor.replaceWith(addDescr.el);
            } else {
                this.rootElem.classList.remove("res-vac-preview--xxl");
                addDescr.el.replaceWith(addDescr.anchor);
            }

            if (findOpt("Выделить название объявления цветом"))
                this.rootElem.classList.add("res-vac-preview--colored");
            else this.rootElem.classList.remove("res-vac-preview--colored");

            function findOpt(optValue) {
                return checkedOptions.find(opt => opt.value === optValue);
            }
        }
    }
    getDate() {
        const date = new Date();
        const day = date.getDay().toString();
        const month = date.getMonth().toString();
        const year = date.getFullYear();
        return `${day.length < 2 ? "0" + day : day}.${month.length < 2 ? "0" + month : month}.${year}`;
    }
    onInputChange() {
        this.setInfo();
    }
    setInfo() {
        setTimeout(() => {
            getMain.call(this);
            getRegionAndDate.call(this);
            getSchedule.call(this);
            getPhoto.call(this);
        }, 0);

        function getMain() {
            for (let key in this.inputs) {
                const input = this.inputs[key];
                const infoBlock = this.infoBlocks[key];
                if (!infoBlock) continue;

                const value = input.value.trim() || infoBlock.default;
                infoBlock.el.innerHTML = "";
                infoBlock.el.insertAdjacentHTML("afterbegin", value);
            }
        }
        function getRegionAndDate() {
            const regionAndLocation = this.inputs.region.value || "Нижний Новгород" + ", " + this.date;
            this.infoBlocks.locationAndDate.el.innerHTML = "";
            this.infoBlocks.locationAndDate.el.insertAdjacentHTML("afterbegin", regionAndLocation);
        }
        function getSchedule() {
            const scheduleBlocks = findInittedInput(".bordered-block--schedule", true);
            let text = "";
            scheduleBlocks.forEach((scBl, index) => {
                const workDaysParams = scBl.inputsParams.find(inpParams => {
                    return inpParams.input.getAttribute("aria-label") === "Дни работы";
                });
                const shiftParams = scBl.inputsParams.find(inpParams => {
                    return inpParams.input.getAttribute("id").includes("shift");
                });
                const workHoursPerDayParams = scBl.inputsParams.find(inpParams => {
                    return inpParams.input.getAttribute("id").includes("work-hours");
                });

                workDaysParams.checked.forEach((cb, cbIndex, arr) => {
                    let plusText = "";
                    if (cb.value.includes("свой вариант")) {
                        const textarea = findClosest(cb, "textarea[name*='schedule-user']");
                        if (!textarea) return;
                        if (!textarea.value) return;

                        plusText = textarea.value;
                    } else plusText = cb.value;

                    if (cbIndex !== arr.length - 1) plusText += ", ";
                    text += plusText;
                });
                let workHours = workHoursPerDayParams.input.value;
                if (workHours.includes("свое количество")) {
                    const hoursInp = scBl.inputsParams.find(inpParams => {
                        return inpParams.input.getAttribute("id").includes("work-hours-user");
                    });
                    if (hoursInp) {
                        const hoursValue = hoursInp.input.value.toString();
                        let suffix = " часов";
                        if (hoursValue < 5
                            || (parseInt(hoursValue[hoursValue.length - 1]) < 5 && parseInt(hoursValue[hoursValue.length - 2] === 1))
                        ) suffix = " часа";
                        workHours = hoursValue + suffix;
                    }
                    else workHours = "";
                }
                if (shiftParams) text += ", " + shiftParams.input.value + " смена, " + workHours;
                else text += ", " + workHours;

                if (index !== scheduleBlocks.length - 1) text += " | ";
            });
            text = text.trim();
            if (text[text.length - 1] === ",") {
                const split = text.split("");
                split[text.length - 1] = "";
                text = split.join("");
            }

            this.infoBlocks.schedule.el.innerHTML = "";
            this.infoBlocks.schedule.el.insertAdjacentHTML("afterbegin", text);
        }
        function getPhoto() {
            const photoInput = findInittedInput(".add-photo");
            if (!photoInput) return;

            const photoData = photoInput.images[0];
            if (!photoData) return;

            const photo = photoData.img;
            this.infoBlocks.el.photo.innerHTML = "";
            const img = createElement("img", "res-vac-preview__photo-img");
            img.src = photo.src;
            this.infoBlocks.el.photo.append(img);
        }
    }
}

function getScrollWidth() {
    const block = createElement("div", "", "<div></div>");
    block.style.cssText = "position: absolute; left: -100vw; z-index: -9; overflow: scroll; width: 100px; height: 100px;";
    block.querySelector("div").style.cssText = "height: 250px; width: 100%";
    document.body.append(block);
    const width = block.offsetWidth - block.clientWidth;
    block.remove();
    return width;
}

const lockScrollObserver = new MutationObserver(() => {
    const wrapper = document.querySelector(".wrapper");
    if (document.body.classList.contains("__locked-scroll"))
        wrapper.style.paddingRight = `${getScrollWidth()}px`;
    else wrapper.style.removeProperty("padding-right");
});
lockScrollObserver.observe(document.body, { attributes: true });

let inittingSelectors = [
    { selector: ".cookie", classInstance: Cookie },
    { selector: ".resume__choose", classInstance: ChooseTabs },
    { selector: "[data-status-dependable-text]", classInstance: StatusDependableText },
    { selector: "[data-status-dependable-display]", classInstance: StatusDependableDisplay },
    { selector: ".resume__rubricks", classInstance: Rubricks },
    { selector: "#options", classInstance: Options },
    { selector: "#promotion", classInstance: PromotionBlock },
    { selector: "[data-promotion-option*='changeable']", classInstance: ChangeablePricePromotion },
    { selector: "[data-promotion-about]", classInstance: PromotionAbout },
    { selector: ".spoiler", classInstance: Spoiler },
    { selector: "[data-hover-title]", classInstance: HoverTitle },
    { selector: ".star-rating", classInstance: StarRating },
    { selector: ".res-vac-preview", classInstance: ResumeVacancyPreview },
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
            if (inittingNode.closest("[data-addfield-hide]")) return;
            const inputParams = new classInstance(inittingNode);
            if (selectorData.flag) inputParams.instanceFlag = selectorData.flag;
            inittedInputs.push(inputParams);
        });
    });
    inittedInputs = inittedInputs.filter(inpParams => inpParams.rootElem);

    browsersFix();
}

let isInitting = false;
const inittingInputsBodyObserver = new MutationObserver(() => {
    if (isInitting) return;

    isInitting = true;
    initInputs();
    setTimeout(() => isInitting = false, 0);
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
        this.setRegions = this.setRegions.bind(this);

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-required");
        this.errorMessage = this.rootElem.querySelector(".work-error");
        this.wrongValueMessageBlock = this.rootElem.querySelector(".text-input__wrong-value");
        this.selectsTransitionDur = 300;
        this.setMaxHeight = true;
        if (this.rootElem.hasAttribute("data-unset-max-height")) {
            this.rootElem.removeAttribute("data-unset-max-height");
            this.setMaxHeight = false;
        }

        const params = this.rootElem.dataset.params || "";
        const properties = params.split("; ");
        this.params = assignPropertiesToObj(properties);

        document.addEventListener("click", this.onDocumentClick);
    }
    getTagLists() {
        const tagsListName = this.rootElem.dataset.tagsSelect;
        if (tagsListName)
            return document.querySelectorAll(`[data-tags-list="${tagsListName}"]`);

        return null;
    }
    createControls() {
        const wrapperClass = this.inputWrapper.className.split(" ")[0];
        Array.from(this.inputWrapper.querySelectorAll("." + wrapperClass + "> div"))
            .concat(Array.from(this.inputWrapper.querySelectorAll("." + wrapperClass + "> span")))
            .forEach(el => {
                const isException = el !== this.input
                    && !el.classList.contains("selects-wrap")
                    && !el.classList.contains("selects-wrap-checkbox");
                if (isException) el.remove();
            });
        const selectsWrap = this.inputWrapper.querySelector(`[class*="selects-wrap"]`);
        const controlsLayout = `
            ${selectsWrap ? `<span class="arrow"></span>` : ""}
            <span class="cross">
            <svg>
                <use xlink:href="#cross-icon"></use>
            </svg>
            </span>
            <div class="prompt-hover__open">Очистить поле?</div>
        `;
        this.inputWrapper.insertAdjacentHTML("beforeend", controlsLayout);
        if (!selectsWrap) this.input.style.paddingRight = "50px";

        this.clearButton = this.rootElem.querySelector(".cross");
        this.clearButton.addEventListener("click", this.clear);
    }
    initInput() {
        this.input.addEventListener("input", this.onInput);
        this.input.addEventListener("focus", this.onFocus);
        this.input.addEventListener("change", this.onChange);
        this.input.addEventListener("blur", this.onChange);
        if (this.isNumbersOnly) this.input.addEventListener("input", this.typeNumbersOnly);
    }
    onInput(event) {
        const value = this.input.value;

        if (this.selectsWrap) this.highlitMatches();
        if (value) this.rootElem.classList.remove("__uncompleted");

        if (value) this.inputWrapper.classList.add("__has-value");
        else this.inputWrapper.classList.remove("__has-value");

        if (!this.selectValues) this.closeSelects();

        this.checkCompletion(event);
    }
    onFocus() {
        const value = this.input.value;
        if (this.params.highlightOnInput && !value.trim()) return;
        else this.openSelects();
        this.toggleCompletionBg();
    }
    onChange() {
        const value = this.input.value;
        if (this.maskData) {
            const userValue = this.getClearedFromMaskValue(value);
            if (!userValue) this.input.value = "";
        }
        this.rootElem.classList.remove("__wrong-value");
        this.checkCompletion();
        this.toggleCompletionBg();
    }
    clear() {
        this.input.value = "";
        this.input.dispatchEvent(new Event("input"));
        this.input.dispatchEvent(new Event("change"));
    }
    onDocumentClick(event) {
        if (event.target === this.input) return;

        this.closeSelects();
    }
    typeNumbersOnly(event) {
        const input = event.target;
        const value = input.value;
        input.value = value.replace(/\D/g, "");
        if (this.params.min) {
            const min = parseInt(this.params.min);
            if (min < 0 || (!min && min !== 0)) return;

            if (parseInt(input.value) < min) input.value = min;
        }
        if (this.params.max) {
            const max = parseInt(this.params.max);
            if (max < 0 || (!max && max !== 0)) return;

            if (parseInt(input.value) > max) input.value = max;
        }
    }
    getSelectsWrap() {
        this.selectsWrap = this.rootElem.querySelector(".selects-wrap")
            || this.rootElem.querySelector(".selects-wrap-checkbox");
        if (!this.selectsWrap) return;

        let selector = ".selects-wrap__option";
        if (this.selectsWrap.classList.contains("selects-wrap-checkbox"))
            selector = ".selects-checkbox";

        this.selectValues = Array.from(this.selectsWrap.querySelectorAll(selector));
        if (!this.selectValues.length) {
            this.selectValues = null;
            return;
        }
    }
    getSelectsHeight() {
        const clone = this.selectsWrap.cloneNode(true);
        const width = this.selectsWrap.parentNode.offsetWidth;
        const hiddenElements = clone.querySelectorAll(".none");
        hiddenElements.forEach(el => el.classList.remove("none"));
        clone.style.cssText = `width: ${width}px; overflow: visible; max-height: unset; visibility: visible; position: absolute;`;
        document.body.append(clone);
        const height = clone.offsetHeight;
        clone.remove();
        return height;
    }
    closeSelects() {
        this.rootElem.classList.remove("open-selects");
        if (!this.selectsWrap) return;

        this.selectsWrap.style.maxHeight = "0";
        this.selectsWrap.style.removeProperty("visibility");
        this.selectsWrap.style.overflow = "hidden";
        this.selectsWrap.style.cssText = "padding: 0; margin: 0;";
    }
    openSelects() {
        if (!this.selectsWrap || !this.selectValues) return;

        this.rootElem.classList.add("open-selects");
        const maxHeight = this.getSelectsHeight();
        setTimeout(() => {

            this.selectsWrap.style.cssText = `visibility: visible; overflow: hidden;`;
            if (this.setMaxHeight) this.selectsWrap.style.maxHeight = `${maxHeight}px`;
            setTimeout(() => {
                this.selectsWrap.style.removeProperty("transition");
                this.selectsWrap.style.removeProperty("overflow");
            }, this.selectsTransitionDur);
        }, 0);
    }
    highlitMatches(fullMatch = null) {
        if (!this.selectValues) return;

        const value = this.input.value.toLowerCase().trim();
        const noMatch = !Boolean(this.selectValues.find(selVal => {
            const text = selVal.text.trim().toLowerCase();
            const val = this.input.value.toLowerCase().trim();
            return text.includes(val);
        }));
        noMatch && !value.includes("выбрано") && !value.includes("Выбрано")
            ? this.selectsWrap.classList.add("none")
            : this.selectsWrap.classList.remove("none");

        if (!value && this.params.highlightOnInput === "true") this.selectsWrap.classList.add("none");
        else {
            this.selectsWrap.classList.remove("none");
            if (document.activeElement === this.input) this.openSelects();
        }

        if (!fullMatch) {
            fullMatch = this.selectValues.find(selVal => {
                return selVal.text.toLowerCase().trim() === value;
            });
        }

        if (fullMatch) {
            this.selectValues.forEach(selVal => {
                selVal.node.classList.remove("none");
                const substr = renderHighlight(selVal.text, value);
                this.setHighlightedText(substr, selVal);
            });
        } else {
            this.selectValues.forEach(selVal => {
                const valText = selVal.text;
                const valTextMod = valText.toLowerCase().trim();
                if (valTextMod.includes(value)) {
                    selVal.node.classList.remove("none");
                    const substr = renderHighlight(valText, value);

                    this.setHighlightedText(substr, selVal);
                } else if (!this.input.value.includes("выбрано") && !this.input.value.includes("Выбрано")) {
                    if (this.params.showUnmatched !== "true") selVal.node.classList.add("none");
                }
            });
        }

        function renderHighlight(valText, value) {
            const valTextMod = valText.toLowerCase().trim();
            const substrPos = valTextMod.indexOf(value);
            const substrEnd = substrPos + value.length;
            let substr = valText.slice(0, substrPos)
                + `<span class="highlight">${valText.slice(substrPos, substrEnd)}</span>`
                + valText.slice(substrEnd);
            return substr;
        }
    }
    checkCompletion() {
        this.isCompleted = Boolean(this.rootElem.querySelector("input:checked"));
        return this.isCompleted;
    }
    toggleCompletionBg() {
        setBg = setBg.bind(this);
        removeBg = removeBg.bind(this);

        if (document.activeElement === this.input) {
            removeBg();
            return;
        }

        if (this.isCompleted) setBg();
        else removeBg();

        function setBg() {
            if (!this.completionBg) {
                this.completionBg = createElement("div", "completed-bg");
                this.inputWrapper.append(this.completionBg);
            }
            this.completionBg.classList.remove("none");
        }
        function removeBg() {
            if (!this.completionBg) return;
            this.completionBg.classList.add("none");
        }
    }
    createTag(value) {
        const tagInner = `
            <div class="tags-list__item-text">${value}</div>
            <svg class="tags-list__item-cross"><use xlink:href="#cross-icon"></use></svg>
        `;
        const tag = createElement("li", "tags-list__item", tagInner);
        const removeButton = tag.querySelector(".tags-list__item-cross");
        return { tag, removeButton };
    }
    // сделан специально для классов с Regions
    setRegions() {
        const val = this.input.value;
        let query = val.trim();
        if (!query) {
            this.editSelectValues({
                removeCurrentValues: true,
                values: []
            });
            return;
        };
        if (this.params.regionsOnly === "true") query = `регион ${query}`;
        if (this.params.citiesOnly === "true") query = `г ${query}`;

        fetchMapData(query)
            .then(json => {
                const values = json.suggestions.map(obj => obj.value);

                this.editSelectValues({
                    removeCurrentValues: true,
                    values
                })
            });
    }
}

class TextInput extends Input {
    constructor(node) {
        super(node);
        this.onMaskInput = this.onMaskInput.bind(this);
        this.wrapInMask = this.wrapInMask.bind(this);

        this.init();
    }
    init() {
        this.input = this.rootElem.querySelector(".text-input__input");
        this.mask = this.input.dataset.inputMask;
        this.completionMask = this.input.dataset.completionMask;
        this.isNumbersOnly = this.input.hasAttribute("data-numbers-only");
        this.inputWrapper = this.rootElem.querySelector(".text-input__wrapper");
        this.selectCreateInputs = [];
        if (!this.inputWrapper) this.inputWrapper = this.rootElem;

        if (this.rootElem.hasAttribute("data-select-controls")) this.createControls();
        this.closeSelects();
        this.getSelectsWrap();
        this.initInput();
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
    createControls() {
        const wrapperClass = this.inputWrapper.className.split(" ")[0];
        Array.from(this.inputWrapper.querySelectorAll("." + wrapperClass + "> div"))
            .concat(Array.from(this.inputWrapper.querySelectorAll("." + wrapperClass + "> span")))
            .forEach(el => {
                if (el !== this.input
                    && !el.classList.contains("selects-wrap")
                    && !el.classList.contains("text-input__wrong-value")) el.remove();
            });
        const selectsWrap = this.inputWrapper.querySelector(`[class*="selects-wrap"]`);
        const controlsLayout = `
            ${selectsWrap ? `<span class="arrow"></span>` : ""}
            <span class="cross">
            <svg>
                <use xlink:href="#cross-icon"></use>
            </svg>
            </span>
            <div class="prompt-hover__open">Очистить поле?</div>
        `;
        this.inputWrapper.insertAdjacentHTML("beforeend", controlsLayout);
        if (!selectsWrap) this.input.style.paddingRight = "50px";

        this.clearButton = this.rootElem.querySelector(".cross");
        this.clearButton.addEventListener("click", this.clear);
    }
    checkCompletion(event) {
        const value = this.input.value;

        if (this.mask) {
            const regexp = new RegExp(this.mask);
            this.isCompleted = Boolean(value.match(regexp));
        }
        else if (this.completionMask) {
            const regexp = new RegExp(this.completionMask);
            this.isCompleted = Boolean(value.match(regexp));
        }
        else this.isCompleted = Boolean(value);

        const doSetUncompleteClass = !event || event && event.type !== "input";

        if (!this.isCompleted && value) {
            this.rootElem.classList.add("__wrong-value");
        }
        else {
            if (doSetUncompleteClass && this.input.value)
                this.rootElem.classList.remove("__uncompleted");
            this.rootElem.classList.remove("__wrong-value");
        }

        return this.isCompleted;
    }
    getSelectsWrap() {
        super.getSelectsWrap();
        if (!this.selectValues) return;

        this.selectValues = this.selectValues.map(selVal => {
            const selectCreateInputsData = handleSelectCreateInputs.call(this);
            let createInputSelector;
            if (selectCreateInputsData)
                createInputSelector = selectCreateInputsData.createInputSelector;


            return {
                node: selVal,
                text: selVal.textContent.trim() || val.innerText,
                createInputSelector
            };

            function handleSelectCreateInputs() {
                const createInputSelector = selVal.dataset.selectCreateInput;
                if (!createInputSelector) return;
                let createInput, createInputAnchor;

                createInput = findClosest(selVal, createInputSelector);
                createInputAnchor = createElement("div", "none");

                if (!this.selectCreateInputs[createInputSelector]) {
                    this.selectCreateInputs[createInputSelector] = { createInput, createInputAnchor };
                }

                return { createInputSelector };
            }
        });

        for (let key in this.selectCreateInputs) {
            const createInputData = this.selectCreateInputs[key];
            createInputData.createInput.replaceWith(createInputData.createInputAnchor);
        }

        this.selectValues.forEach(selVal => {
            selVal.node.addEventListener("click", () => {
                this.input.value = selVal.text;
                this.input.dispatchEvent(new Event("input"));
                this.input.dispatchEvent(new Event("change"));
                if (this.getTagLists()) this.addTag();

                if (selVal.createInputSelector) {
                    this.hideCreatedInputs();
                    const createInputData = this.selectCreateInputs[selVal.createInputSelector];
                    createInputData.createInputAnchor.replaceWith(createInputData.createInput);
                } else this.hideCreatedInputs();
            });
        });
    }
    editSelectValues(params = {}) {
        /*  params состоит из указанных ниже значений
            первые значения идут по умолчанию
            removeCurrentValues: false|true - удалить ли текущие значения в списке
            values: ["", "", ..., ""] - массив строк добавляемых значений
        */
        setDefaultParams();

        let innerhtml = "";
        if (!this.selectsWrap)
            this.selectsWrap = this.rootElem.querySelector(".selects-wrap");
        params.values.forEach(value => innerhtml += createItem(value));

        if (params.removeCurrentValues) this.selectsWrap.innerHTML = "";
        this.selectsWrap.insertAdjacentHTML("beforeend", innerhtml);

        this.getSelectsWrap();
        this.highlitMatches();

        function setDefaultParams() {
            if (!Array.isArray(params.values)) params.values = [];
        }
        function createItem(value) {
            return `<p class="selects-wrap__option small-text">${value}</p>`;
        }
    }
    hideCreatedInputs() {
        if (!this.selectValues) return;

        this.selectValues.forEach(selVal => {
            if (selVal.createInputSelector) {
                const createInputData = this.selectCreateInputs[selVal.createInputSelector];
                createInputData.createInput.replaceWith(createInputData.createInputAnchor);
            }
        });
    }
    clear() {
        super.clear();
        this.hideCreatedInputs();
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
    setHighlightedText(substr, selVal) {
        selVal.node.innerHTML = substr;
    }
    addTag() {
        const tagsLists = this.getTagLists();
        tagsLists.forEach(tagList => {
            const createdTag = this.createTag(this.input.value);
            tagList.querySelectorAll(".tags-list__item").forEach(tagItem => tagItem.remove());
            tagList.append(createdTag.tag);
            createdTag.removeButton.addEventListener("click", this.removeTag.bind(this));
        });
    }
    removeTag() {
        const tagsLists = this.getTagLists();
        tagsLists.forEach(tagList => {
            tagList.querySelectorAll(".tags-list__item").forEach(tagItem => tagItem.remove());
            this.input.value = "";
            this.input.dispatchEvent(new Event("change"));
        });
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

class TimeScheduleList {
    constructor(node) {
        if (node.closest(".popup--time-schedule")) return;

        this.onInputChange = this.onInputChange.bind(this);
        this.initLunchInputs = this.initLunchInputs.bind(this);
        this.onLunchInputChange = this.onLunchInputChange.bind(this);

        this.rootElem = node;
        this.items = inittedInputs.filter(inpParams => {
            return inpParams instanceof TimeScheduleItem
                && inpParams.rootElem.closest(".time-schedule") === this.rootElem;
        });
        this.items.forEach(timeScheduleItem => {
            const inputs = timeScheduleItem.inputs;
            inputs.forEach(inpParams => {
                inpParams.input.addEventListener("change", () => this.onInputChange(timeScheduleItem));
            });

            timeScheduleItem.rootElem.addEventListener("added-lunch", this.initLunchInputs);
        });
    }
    isValidInputs(input1, input2) {
        const validFirst = isValidValue(input1),
            validSecond = isValidValue(input2);

        if (!validFirst || !validSecond) return false;
        return true;

        function isValidValue(input) {
            const value = input.value;
            if (!value || value.length < 5) return;

            const hours = parseInt(value[0] + value[1]);
            const minutes = parseInt(value[3] + value[4]);
            const isValid = (hours >= 0 && hours < 24)
                && (minutes >= 0 && minutes <= 60)
                && value[2] === ":";
            return isValid;
        }
    }
    createPopupForAllIntervals(timeScheduleItem, inputs = [], popupTitle, applyCallback, keyTitle = "inputs") {
        if (document.querySelector(".popup--time-schedule")) return;

        const input1 = inputs[0];
        const input2 = inputs[1];
        if (!this.isValidInputs(input1, input2)) return;

        handlePopupInputs = handlePopupInputs.bind(this);

        const checkedByCheckbox = {};
        this.items.forEach(item => {
            const checkedCb = item.checkboxes.find(cb => cb.checked);
            if (!checkedCb) return;

            const name = checkedCb.name;
            let dayTitle = name.match(/-.*day/);
            if (dayTitle) dayTitle = dayTitle[0].replace("-", "");
            checkedByCheckbox[dayTitle] = true;
        });

        const popupInner = `
            <h3 class="popup__title">${popupTitle}</h3>
            ${checkedByCheckbox.monday ? "" : layoutItem("ПН", "monday")}
            ${checkedByCheckbox.tuesday ? "" : layoutItem("ВТ", "tuesday")}
            ${checkedByCheckbox.wednesday ? "" : layoutItem("СР", "wednesday")}
            ${checkedByCheckbox.thursday ? "" : layoutItem("ЧТ", "thursday")}
            ${checkedByCheckbox.friday ? "" : layoutItem("ПТ", "friday")}
            ${checkedByCheckbox.saturday ? "" : layoutItem("СБ", "saturday")}
            ${checkedByCheckbox.sunday ? "" : layoutItem("ВС", "sunday")}
            <button class="button popup--time-schedule__button">
                <span class="small-text">Подтвердить</span>
            </button>
            `;

        const popup = new Popup({ popupInner });
        popup.init();
        popup.rootElem.classList.add("popup--time-schedule");
        setTimeout(() => handlePopupInputs(popup), 0);

        function handlePopupInputs(popup) {
            // получить те input'ы, что находятся в popup'е
            const popupTimeScheduleItems = inittedInputs.filter(inpParams => {
                const isInstance = inpParams instanceof TimeScheduleItem;
                const isInPopup = inpParams.rootElem.closest(".popup--time-schedule");
                return isInstance && isInPopup;
            });
            popupTimeScheduleItems.forEach(item => {
                const inputs = item.inputs;

                inputs[0].setDefaultTime(timeScheduleItem[keyTitle][0].input.value);
                inputs[1].setDefaultTime(timeScheduleItem[keyTitle][1].input.value);
            });

            popup.rootElem.addEventListener("popup-remove", () => {
                // убрать из списка инициализированных input'ов те, что были в popup'е
                inittedInputs =
                    inittedInputs.filter(inpParams => !popupTimeScheduleItems.includes(inpParams));
            });

            // применить изменения при нажатии на соответствующую кнопку
            const applyBtn = popup.rootElem.querySelector(".popup--time-schedule__button");
            applyBtn.addEventListener("click", () => {
                const appliedList = [];
                popupTimeScheduleItems.forEach(item => {
                    const applyCbox = item.rootElem.querySelector("[name='confirm_time_schedule']");
                    if (!applyCbox.checked) return;

                    appliedList.push(applyCbox);
                });
                applyCallback(appliedList, popupTimeScheduleItems);
                popup.remove();
            });
        }
        function layoutItem(dayTitle, dayIndex) {
            // dayTitle === "ПН", "ВТ", ...; dayIndex === "monday", "tuesday"...
            return `
            <div class="time-schedule__item time-schedule__item--center">
                <div class="time-schedule__title">${dayTitle}</div>
                <div class="time-schedule__body">
                    <div class="time-schedule__inputs">
                        <div class="time-schedule__select text-input">
                            <div class="text-input__wrapper">
                                <input class="text-input__input" type="text">
                            </div>
                        </div>
                        <div class="time-schedule__select text-input">
                            <div class="text-input__wrapper">
                                <input class="text-input__input" type="text">
                            </div>
                        </div>
                    </div>
                    <div class="time-schedule__checkboxes">
                        <div class="time-schedule__checkbox flex">
                            <input id="confirm_time_schedule-${dayIndex}" class="mr-5 checkbox" type="checkbox" value="Принять" name="confirm_time_schedule" checked>
                            <label for="confirm_time_schedule-${dayIndex}" class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                            </label>
                            <label for="confirm_time_schedule-${dayIndex}" class="text small-text">
                                Принять
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            `
        }
    }
    onInputChange(timeScheduleItem) {
        const inputs = [timeScheduleItem.inputs[0].input, timeScheduleItem.inputs[1].input];
        this.createPopupForAllIntervals(
            timeScheduleItem,
            inputs,
            "Перенести на все дни недели этот интервал работы",
            applyCallback.bind(this),
            "inputs"
        );

        function applyCallback(appliedList, popupTimeScheduleItems) {
            appliedList.forEach(appl => {
                let dayTitle = appl.id.match(/-.+day/);
                if (!dayTitle) return;

                dayTitle = dayTitle[0].replace("-", "");
                // те, что были в попапе
                const popupItem = popupTimeScheduleItems
                    .find(i => i.rootElem === appl.closest(".time-schedule__item"));
                // те, что вне попапа (т.е. на которые и будет перенесен график из попапа)
                const rootItem = this.items
                    .find(i => i.rootElem.querySelector(`input[name*=${dayTitle}]`));

                // перенести график на настоящие input'ы
                if (popupItem && rootItem) {
                    rootItem.inputs[0].setDefaultTime(popupItem.inputs[0].input.value);
                    rootItem.inputs[1].setDefaultTime(popupItem.inputs[1].input.value);
                }
            });
        }
    }
    initLunchInputs(event) {
        const item = this.items.find(i => i.rootElem === event.target);
        if (!item.lunchInputs) return;

        item.lunchInputs.forEach(inpParams => {
            inpParams.input.addEventListener("change", () => this.onLunchInputChange(item));
        });
    }
    onLunchInputChange(timeScheduleItem) {
        const inputs = [timeScheduleItem.lunchInputs[0].input, timeScheduleItem.lunchInputs[1].input];
        this.createPopupForAllIntervals(
            timeScheduleItem,
            inputs,
            "Перенести на все дни недели этот интервал обеда",
            applyCallback.bind(this),
            "lunchInputs"
        )

        function applyCallback(appliedList, popupTimeScheduleItems) {
            appliedList.forEach(appl => {
                let dayTitle = appl.id.match(/-.+day/);
                if (!dayTitle) return;

                dayTitle = dayTitle[0].replace("-", "");
                // те, что были в попапе
                const popupItem = popupTimeScheduleItems
                    .find(i => i.rootElem === appl.closest(".time-schedule__item"));
                // те, что вне попапа (т.е. на которые и будет перенесен график из попапа)
                const rootItem = this.items
                    .find(i => i.rootElem.querySelector(`input[name*=${dayTitle}]`));
                if (!rootItem.lunchInputs) {
                    const addLunchButton =
                        rootItem.rootElem.querySelector(".time-schedule__button--lunch .add__button");
                    rootItem.rootElem.addEventListener("added-lunch", setLunchTime);
                    addLunchButton.click();
                } else setLunchTime();

                function setLunchTime() {
                    if (popupItem && rootItem && rootItem.lunchInputs) {
                        rootItem.lunchInputs[0].setDefaultTime(popupItem.inputs[0].input.value);
                        rootItem.lunchInputs[1].setDefaultTime(popupItem.inputs[1].input.value);
                    }
                }
            });
        }
    }
}

class TimeScheduleItem {
    constructor(node) {
        this.onCheckboxChange = this.onCheckboxChange.bind(this);
        this.onAddLunchClick = this.onAddLunchClick.bind(this);

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-required");
        this.inputs = Array.from(this.rootElem.querySelectorAll(".time-schedule__select"))
            .map(inp => {
                const inittedTSParams = inittedInputs.find(inpParams => inpParams.rootElem === inp);
                const timeScheduleParams = inittedTSParams || new TimeScheduleInput(inp);

                return timeScheduleParams;
            });
        this.addLunchButton = this.rootElem.querySelector(".time-schedule__button--lunch");
        this.checkboxes = Array.from(
            this.rootElem
                .querySelectorAll(".time-schedule__checkbox input[type='checkbox']")
        );
        this.checkboxes.forEach(cb => {
            cb.addEventListener("change", this.onCheckboxChange);
            this.setCheckedCheckbox(cb);
        });

        if (this.addLunchButton) this.addLunchButton.addEventListener("click", this.onAddLunchClick);
    }
    onCheckboxChange(event) {
        const checkbox = event.target;
        if (checkbox.closest(".popup--time-schedule")) {

            return;
        }

        setTimeout(() => this.setCheckedCheckbox(checkbox), 100);
    }
    setCheckedCheckbox(checkbox) {
        if (checkbox.closest(".popup--time-schedule")) return;

        if (checkbox.checked) {

            const checkboxesContainer = checkbox.closest(".time-schedule__checkboxes");
            const name = checkbox.getAttribute("name");
            let hideableElems;
            if (checkbox.value === "misc") {
                const timeScheduleItems = Array.from(
                    checkbox.closest(".time-schedule")
                        .querySelectorAll(".time-schedule__item:not(.time-schedule__item--misc)")
                );
                hideableElems = timeScheduleItems.map(tsItem => {
                    return { elem: tsItem }
                });
            } else {
                hideableElems = [
                    { elem: findClosest(checkbox, ".time-schedule__body") },
                    { elem: findClosest(checkbox, ".time-schedule__button") }
                ];
            }
            const otherCheckboxes = Array.from(document.querySelectorAll(`[name="${name}"]`))
                .filter(cb => cb !== checkbox);

            otherCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
                hideableElems.push({ elem: checkbox.closest(".time-schedule__checkbox") });
            });
            hideableElems.forEach(elemData => {
                elemData.anchor = createElement("div", "none");
                elemData.elem.replaceWith(elemData.anchor);
            });
            checkboxesContainer.classList.add("__active");

            checkbox.addEventListener("change", onUnsetChange);

            function onUnsetChange() {
                if (checkbox.checked) return;

                checkbox.removeEventListener("change", onUnsetChange);
                hideableElems.forEach(elemData => elemData.anchor.replaceWith(elemData.elem));
                checkboxesContainer.classList.remove("__active");
            }
        }
    }
    checkCompletion() {
        const checkedCheckbox = this.checkboxes.find(cb => cb.checked);
        if (checkedCheckbox) {
            this.isCompleted = true;
            this.rootElem.classList.remove("__uncompleted");
        } else {
            const completedInputs = [];
            const uncompletedInputs = this.inputs.filter(inpParams => {
                const isCompleted = inpParams.checkCompletion();
                if (isCompleted) completedInputs.push(inpParams);
                return isCompleted ? false : true;
            });
            this.isCompleted = Boolean(uncompletedInputs.length < 1);

            uncompletedInputs.forEach(inpParams => inpParams.rootElem.classList.add("__uncompleted"));
            completedInputs.forEach(inpParams => inpParams.rootElem.classList.remove("__uncompleted"));
        }

        if (!this.isCheckingHandler) this.setCheckingCompletionHandler();
        setTimeout(() => {
            this.rootElem.classList.remove("__uncompleted");
        }, 0);

        return this.isCompleted;
    }
    setCheckingCompletionHandler() {
        if (this.isCheckingHandler) return;

        this.inputs.forEach(inpParams => {
            inpParams.input.addEventListener("input", () => {
                inpParams.checkCompletion();
                this.checkCompletion();
            });
        });
        this.checkboxes.forEach(cb => cb.addEventListener("change", () => {
            this.inputs.forEach(inpParams => inpParams.checkCompletion());
            this.checkCompletion();
        }));
        this.isCheckingHandler = true;
    }
    onAddLunchClick() {
        setTimeout(() => {
            const newInputs = inittedInputs.filter(inpParams => {
                const isChild = inpParams.rootElem.closest(".time-schedule__item") === this.rootElem;
                const isInput = inpParams instanceof TimeScheduleInput;
                return isChild && isInput;
            }).filter(inpParams => !this.inputs.includes(inpParams));
            this.lunchInputs = newInputs;
            this.rootElem.dispatchEvent(new CustomEvent("added-lunch"));
        }, 0);
    }
}

class TimeScheduleInput extends TextInput {
    constructor(node) {
        super(node);

        this.createSelectOptions();
        this.createControls();
        this.init();
        this.input.addEventListener("input", this.typeNumbersOnly);
        this.input.setAttribute("maxlength", "5");
    }
    createSelectOptions() {
        let options = createTimeOptions();
        this.selectsWrap = createElement("div", "selects-wrap", options);
        this.inputWrapper.append(this.selectsWrap);

        function createTimeOptions() {
            let htmlString = "";
            for (let i = 0; i < 24; i++) {
                let hour = i < 10 ? "0" + i.toString() : i.toString();
                let minutes = ["00", "30"];
                minutes.forEach(min => htmlString += createOption(hour, min));
            }

            return htmlString;
        }
        function createOption(hour, minutes) {
            return `
                <p class="selects-wrap__option small-text">
                    ${hour}:${minutes}
                </p>
            `;
        }
    }
    checkCompletion() {
        const value = this.input.value;
        this.isCompleted = Boolean(this.selectValues.find(selValData => selValData.text == value));
        return this.isCompleted;
    }
    setDefaultTime(timestamp = "00:00") {
        const selValues = this.selectValues;
        if (selValues) {
            const value = this.selectValues.find(selVal => selVal.text === timestamp)
                || this.selectValues.find(selVal => selVal.text.includes(timestamp.slice(0, 2)));
            if (!value) return;

            value.node.dispatchEvent(new Event("click"));
        }
    }
    typeNumbersOnly(event) {
        const input = event.target;
        const value = input.value;
        input.value = value.replace(/[^0-9:]/g, "");
    }
}

class ScrollToRubricksButton {
    constructor(node) {
        this.doScroll = this.doScroll.bind(this);

        this.rootElem = node;
        this.rubricksBlock = document.querySelector(".resume__rubricks");
        this.text = this.rootElem.querySelector(".add__text");

        this.rootElem.addEventListener("click", this.doScroll);
    }
    doScroll() {
        this.rubricksBlock.scrollIntoView({
            behavior: "smooth"
        });
    }
}

class Textarea {
    constructor(node) {
        this.onInput = this.onInput.bind(this);

        this.rootElem = node;
        this.input = this.rootElem.querySelector(".textarea-wrapper__input");
        this.maxlength = this.input.getAttribute("maxlength");
        this.minlength = this.input.dataset.minlength;

        this.createMaxText();
        this.onInput();
        this.input.addEventListener("input", this.onInput);
    }
    createMaxText() {
        const maxText = this.rootElem.querySelector(".textarea-wrapper__max-text");
        if (maxText) maxText.remove();

        const maxTextLayout = `
        <div class="textarea-wrapper__max-text">
            <span class="textarea-wrapper__input-count"></span>
            ${this.maxlength
                ? `из <span class="textarea-wrapper__max-count"></span>`
                : ""
            }
            ${this.minlength
                ? `(минимум ${this.minlength})`
                : ""
            }
        </div>
        `;
        this.rootElem.insertAdjacentHTML("beforeend", maxTextLayout);

        this.inputCount = this.rootElem.querySelector(".textarea-wrapper__input-count");
        this.maxCount = this.rootElem.querySelector(".textarea-wrapper__max-count");

        if (this.maxlength) this.maxCount.innerHTML = this.maxlength;
    }
    onInput() {
        const value = this.input.value;
        const count = value ? value.length.toString() : "0";
        this.inputCount.innerHTML = count;
    }
}

class TagsList {
    constructor(node) {
        this.removeTags = this.removeTags.bind(this);
        this.setEmptyOrFilledState = this.setEmptyOrFilledState.bind(this);

        this.rootElem = node;
        this.removeButton = this.rootElem.querySelector(".tags-list__remove-button");
        this.isRequired = this.rootElem.hasAttribute("data-required");

        if (this.removeButton) this.removeButton.addEventListener("click", this.removeTags);
        this.setEmptyOrFilledState();
        const observer = new MutationObserver(this.setEmptyOrFilledState);
        observer.observe(this.rootElem, { childList: true });
        this.rootElem.removeAttribute("data-required");
    }
    getTags() {
        return Array.from(this.rootElem.querySelectorAll(".tags-list__item"));
    }
    setEmptyOrFilledState() {
        if (this.getTags().length < 1) this.rootElem.classList.add("tags-list--empty");
        else this.rootElem.classList.remove("tags-list--empty");

        if (this.rootElem.classList.contains("__uncompleted")) this.checkCompletion();
    }
    checkCompletion() {
        if (!this.isRequired) return true;

        const isCompleted = this.getTags().length > 0;
        isCompleted
            ? this.rootElem.classList.remove("__uncompleted")
            : this.rootElem.classList.add("__uncompleted");

        return isCompleted;
    }
    removeTags() {
        const clickEvent = new Event("click");

        this.getTags().forEach(item => {
            const cross = item.querySelector(".tags-list__item-cross");
            if (cross && !cross.classList.contains("none")) cross.dispatchEvent(clickEvent);
        });
    }
}

class CheckboxesBind {
    constructor(node) {
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        const params = this.rootElem.dataset.checkboxesBind || "";
        const properties = params.split("; ");
        this.params = assignPropertiesToObj(properties);
        this.checkboxes = [this.rootElem];
        this.params.selectors.split(", ").forEach(selector => {
            const cb = findClosest(this.rootElem, selector);
            if (!cb) return;
            this.checkboxes.push(cb);
        });

        this.checkboxes.forEach(cb => {
            cb.addEventListener("change", this.onChange);
        });
    }
    onChange(event) {
        if (!event.isTrusted) return;
        activateBound = activateBound.bind(this);

        const target = event.target;

        if (this.params.twoWays === "true") activateBound();
        else if (target === this.rootElem) activateBound();
        if (!target.checked && this.params.twoWaysOnBoundUncheck) activateBound();

        function activateBound() {
            this.checkboxes.forEach(cb => {
                if (target.checked) cb.checked = true;
                else cb.checked = false;

                cb.dispatchEvent(new Event("change"));
            });
        }
    }
}

class TextInputRegions extends TextInput {
    constructor(node) {
        super(node);

        this.createControls();
        this.input.addEventListener("input", this.setRegions);
    }
}

class TextInputCheckboxes extends Input {
    constructor(node) {
        super(node);
        this.onCbDisableChange = this.onCbDisableChange.bind(this);
        this.apply = this.apply.bind(this);
        this.removeTag = this.removeTag.bind(this);

        this.input = this.rootElem.querySelector(".selects-input-checkbox__input");
        this.ariaLabel = this.input.getAttribute("aria-label") || "";
        this.applyButton = this.rootElem.querySelector(".selects-wrap-checkbox__button");
        this.checkboxesBlock = this.rootElem.querySelector(".selects-wrap-checkbox");
        this.checked = [];
        this.isCheckRequired = this.rootElem.dataset.requiredCheck;
        this.inputWrapper = this.rootElem.querySelector(".selects-input-checkbox__wrapper");
        if (!this.inputWrapper) this.inputWrapper = this.rootElem;

        if (this.rootElem.hasAttribute("data-select-controls")) this.createControls();
        this.getCheckboxes();
        this.checkboxes.forEach(cb => cb.value = cb.value.replace(/\s\s/g, ""));
        this.closeSelects();
        this.initInput();
        if (this.applyButton) this.applyButton.addEventListener("click", this.apply);
        this.getSelectsWrap();
    }
    getCheckboxes() {
        if (!Array.isArray(this.checkboxes)) this.checkboxes = [];

        const newCheckboxes = Array.from(
            this.checkboxesBlock.querySelectorAll(".selects-checkbox"))
            .filter(cb => !this.checkboxes.includes(cb)
            );
        newCheckboxes.forEach(cb => {
            cb.value = cb.value.replace(/\s\s/g, "");
            this.checkboxes.push(cb);
            if (!this.applyButton) cb.addEventListener("change", this.apply);
        });

        this.checkboxesDisable = this.checkboxes.filter(cb => cb.hasAttribute("data-oncheck-disable"))
            .map(cb => {
                const indexes = cb.dataset.oncheckDisable.split(", ")
                    .map(ind => parseInt(ind))
                    .filter(ind => {
                        return ind !== this.checkboxes.indexOf(cb) && (ind || ind === 0);
                    });
                const disablingInputs = indexes.map(ind => this.checkboxes[ind]);
                cb.removeAttribute("data-oncheck-disable");
                cb.addEventListener("change", this.onCbDisableChange);
                return { input: cb, disablingInputs };
            });
    }
    apply(event = null) {
        const notUserChangeEvent = !event || (event && event.isTrusted);

        this.checked = this.checkboxes.filter(checkbox => checkbox.checked);
        if (this.checked.length < 1) this.input.value = "";
        if (this.checked.length === 1) this.input.value = this.checked[0].value;
        if (this.checked.length > 1) {
            if (this.ariaLabel)
                this.input.value = this.ariaLabel + " (выбрано: " + this.checked.length + ")";
            else this.input.value = "Выбрано: " + this.checked.length;
        }
        if (notUserChangeEvent) {
            this.input.dispatchEvent(new Event("change"));
            this.input.dispatchEvent(new Event("input"));
        }

        if (this.applyButton) this.closeSelects();
        if (this.getTagLists() && notUserChangeEvent) this.addTags();

        this.rootElem.dispatchEvent(new CustomEvent("select-change"));
    }
    onCbDisableChange(event) {
        const input = event.target;
        const disablingInputsData = this.checkboxesDisable.find(cbData => cbData.input === input);
        if (!disablingInputsData) return;

        const disablingInputs = disablingInputsData.disablingInputs;
        if (input.checked) {
            disablingInputs.forEach(inp => {
                inp.checked = false;
                inp.setAttribute("disabled", true);
                inp.closest("label").setAttribute("data-disabled", true);
            });
        } else {
            disablingInputs.forEach(inp => {
                inp.removeAttribute("disabled");
                inp.closest("label").removeAttribute("data-disabled");
            });
        }
    }
    onDocumentClick(event) {
        const isException = event.target === this.input
            || event.target === this.checkboxesBlock
            || event.target.closest(".selects-wrap-checkbox");
        if (isException) return;

        this.closeSelects();
    }
    getSelectsWrap() {
        super.getSelectsWrap();
        if (!this.selectValues) return;

        this.selectsWrap.addEventListener("click", (event) => {
            const isButtonTarget = event.target.classList.contains("selects-wrap-checkbox__button")
                || event.target.closest(".selects-wrap-checkbox__button");
            if (isButtonTarget) return;

            this.input.focus();
        });
        this.selectValues = this.selectValues.map(checkbox => {
            return {
                node: checkbox.closest("label"),
                text: checkbox.value.replace(/\s\s/g, ""),
                textNode: checkbox.closest("label").querySelector(".text")
            }
        });
    }
    editSelectValues(params = {}) {
        /*  params состоит из тех же значений, что и у метода TextInput.editSelectValues */
        setDefaultParams();

        let innerhtml = "";
        if (!this.selectsWrap)
            this.selectsWrap = this.rootElem.querySelector(".selects-wrap-checkbox");
        params.values.forEach(value => innerhtml += createItem(value));

        if (params.removeCurrentValues) this.selectsWrap.innerHTML = "";
        this.selectsWrap.insertAdjacentHTML("beforeend", innerhtml);
        this.getSelectsWrap();
        this.getCheckboxes();
        this.highlitMatches();

        function setDefaultParams() {
            if (!Array.isArray(params.values)) params.values = [];
        }
        function createItem(value) {
            return `
            <label class="flex checkboxes__items_item">
                <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="${value}">
                <span class="checkmark">
                <img src="img/checkmark.png" alt="checkmark">
                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                </span>
                <span class="text small-text">${value}</span>
            </label>
            `;
        }
    }
    closeSelects() {
        super.closeSelects();
        this.checkboxes.forEach(cb => {
            const isChecked = this.checked.includes(cb);
            if (isChecked) cb.checked = true;
            else cb.checked = false;
        });
    }
    clear() {
        super.clear();
        this.checkboxes.forEach(cb => {
            if (cb.checked) {
                cb.checked = false;
                this.apply();
            }
        });
    }
    highlitMatches() {
        const fullMatch = this.input.value.includes("выбрано");
        super.highlitMatches(fullMatch);
    }
    setHighlightedText(substr, selVal) {
        selVal.textNode.innerHTML = substr;
    }
    addTags() {
        onTagCrossClick = onTagCrossClick.bind(this);

        if (!Array.isArray(this.tags)) this.tags = [];
        this.checked.forEach(input => {
            const exists = this.tags.find(tagData => tagData.value === input.value);
            if (exists) return;

            const tagData = { input, value: input.value, tags: [] };
            const tagsLists = this.getTagLists();
            tagsLists.forEach(tl => {
                const createdTag = this.createTag(input.value);
                const tag = createdTag.tag;
                tl.append(tag);
                tagData.tags.push(tag);
                createdTag.removeButton
                    .addEventListener("click", onTagCrossClick.bind(this));
            });
            this.tags.push(tagData);
        });
        clearUncheckedFromLists.call(this);

        function clearUncheckedFromLists() {
            this.tags.forEach(tagData => {
                if (tagData.input.checked) return;
                tagData.tags.forEach(tag => this.removeTag(tag));
            });
        }
        function onTagCrossClick(event) {
            const tag = event.target.closest(".tags-list__item");
            this.removeTag(tag);
        }
    }
    removeTag(tag) {
        const tagData = this.tags.find(td => td.tags.indexOf(tag) >= 0);
        if (!tagData) return tag.remove();

        tagData.input.checked = false;
        tagData.input.dispatchEvent(new Event("change"));
        tagData.tags.forEach(t => t.remove());
        this.tags.splice(this.tags.indexOf(tagData), 1);
    }
    setValue(valueText) {
        setTimeout(() => {
            valueText = valueText.replace(/\s\s/g, "");
            if (!this.selectValues) {
                setTimeout(() => this.setValue(valueText), 100);
                return;
            }

            const selectValue = this.selectValues.find(val => val.text === valueText);
            if (!selectValue) return;

            const checkbox = selectValue.node.querySelector("input");
            checkbox.checked = true;
            this.apply();
        }, 0);
    }
    checkCompletion() {
        if (this.isCheckRequired)
            this.isCompleted = Boolean(this.rootElem.querySelector("input:checked"));
        else this.isCompleted = Boolean(this.input.value);
        return this.isCompleted;
    }
}

class TextInputCheckboxesRegion extends TextInputCheckboxes {
    constructor(node) {
        super(node);

        this.setRegions = this.setRegions.bind(this);

        this.createControls();
        this.setRegions();
        this.input.addEventListener("input", this.setRegions);
    }
}

class DateInput {
    constructor(node) {
        this.onInputFocus = this.onInputFocus.bind(this);
        this.onInputBlurOrChange = this.onInputBlurOrChange.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
        this.moveToLeft = this.moveToLeft.bind(this);
        this.onLabelClick = this.onLabelClick.bind(this);

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-required");
        this.inputs = Array.from(this.rootElem.querySelectorAll(".date-inputs__input"));
        this.datesBlock = this.rootElem.closest(".dates-inputs");
        this.wrongValueMessageBlock = this.rootElem.querySelector(".text-input__wrong-value");
        this.label = this.rootElem.querySelector(".date-inputs__label");

        this.currentYear = new Date().getFullYear();
        this.getMinmaxYears();

        this.inputs.forEach(inp => {
            inp.addEventListener("focus", this.onInputFocus);
            inp.addEventListener("blur", this.onInputBlurOrChange);
            inp.addEventListener("input", this.onInput);
            inp.addEventListener("keydown", this.onKeydown);
        });
        this.inputs[2].addEventListener("keydown", this.moveToLeft);
        if (this.label) this.label.addEventListener("click", this.onLabelClick);
        if (this.wrongValueMessageBlock) {
            const removeButton = this.wrongValueMessageBlock.querySelector(".wrong-value__cross");
            removeButton.addEventListener("click", () => {
                this.rootElem.classList.remove("__wrong-value");
            });
        }
    }
    getMinmaxYears() {
        calcYear = calcYear.bind(this);

        let dataset = this.rootElem.dataset.minmaxYears;
        if (!dataset) dataset = "min:1900; max:0";
        const params = assignPropertiesToObj(dataset.split("; "));
        this.minYear = calcYear(params.min || "1900");
        this.maxYear = calcYear(params.max || "0");

        this.rootElem.removeAttribute("data-minmax-years");

        function calcYear(string) {
            const isMathOperation = string.startsWith("+") || string.startsWith("-");
            const isZero = string.replace(/\D/g, "").length === 1 && string.includes("0");
            const isStrictYear = !isMathOperation && !isZero && string.length === 4;
            if (isMathOperation) {
                const num = parseInt(string.replace(/\D/g, ""));
                if (string.startsWith("+")) return this.currentYear + num;
                if (string.startsWith("-")) return this.currentYear - num;
            }
            if (isZero) return this.currentYear;
            if (isStrictYear) return parseInt(string.replace(/\D/g, ""));
        }
    }
    onLabelClick() {
        const notFilledInput = this.inputs.find(input => {
            const maxlength = parseInt(input.getAttribute("maxlength"));
            if (input.value.length < maxlength) return true;
            return false;
        }) || this.inputs[2];

        notFilledInput.focus();
    }
    onInputFocus() {
        this.rootElem.classList.add("__focus");
    }
    onInputBlurOrChange() {
        this.rootElem.classList.remove("__focus");

        this.day = parseInt(this.inputs[0].value);
        this.month = parseInt(this.inputs[1].value);
        this.year = parseInt(this.inputs[2].value);

        this.validateDate();
    }
    onInput(event) {
        const input = event.target;
        const value = input.value;
        input.value = value.replace(/\D/g, "");

        const maxlength = parseInt(input.getAttribute("maxlength"));
        if (input.value.length >= maxlength) {
            const currentIndex = this.inputs.indexOf(input);
            const nextInput = this.inputs[currentIndex + 1];
            if (nextInput) nextInput.focus();
        }

        if (this.rootElem.classList.contains("__uncomplted")) this.checkCompletion();
    }
    moveToLeft(event) {
        const input = event.target;
        const inputIndex = this.inputs.findIndex(i => i === input);
        const prevInput = this.inputs[inputIndex - 1];
        let totalValue = this.inputs.map(inp => inp.value).join("");
        const prevInputs = this.inputs.filter((inp, index) => index < inputIndex);

        if (event.key) {
            totalValue += event.key;
            const notFullPrevInput =
                prevInputs.find(inp => inp.value.length < inp.getAttribute("maxlength"));
            const needToMoveLeft =
                input.value.length == input.getAttribute("maxlength")
                && this.inputs.length - 1 === inputIndex
                && prevInput
                && notFullPrevInput;

            if (needToMoveLeft && !totalValue.match(/\D/g)) {
                this.inputs[2].value = totalValue.slice(-4);
                this.inputs[1].value = totalValue.slice(-6, -4);
                this.inputs[0].value = totalValue.slice(-8, -6);
            }
        }
    }
    onKeydown(event) {
        const input = event.target;
        const inputIndex = this.inputs.findIndex(i => i === input);
        const nextInput = this.inputs[inputIndex + 1];
        const prevInput = this.inputs[inputIndex - 1];
        if (event.code === "Backspace") {
            if (!input.value && prevInput) prevInput.focus();
        }
        if (event.code.includes("Arrow") && (input.selectionStart === input.selectionEnd)) {
            const toNextInp = event.code === "ArrowRight"
                && input.selectionEnd === input.value.length
                && nextInput;
            const toPrevInp = event.code === "ArrowLeft"
                && input.selectionStart === 0 && prevInput;

            if (toNextInp) nextInput.focus();
            if (toPrevInp) prevInput.focus();
        }

        this.replaceNextValueSymbol(event);
    }
    replaceNextValueSymbol(event) {
        const input = event.target;
        if (event.key.length > 1 || input.selectionStart !== input.selectionEnd) return;
        const selStart = input.selectionStart;

        const maxlength = input.getAttribute("maxlength");
        if (input.value.length == maxlength) {
            input.value = input.value.slice(0, selStart);
            setTimeout(() => {
                input.selectionStart = input.selectionEnd = selStart + 1;
            }, 0);
        }
    }
    checkCompletion() {
        this.isCompleted = this.validateDate().isValid;
        return this.isCompleted;
    }
    validateDate() {
        let validDay;
        if (this.month === 1 || this.month === 3 || this.month === 5 || this.month === 7 || this.month === 8 || this.month === 10 || this.month === 12) validDay = this.day <= 31;
        if (this.month === 2) validDay = this.day <= 28
        else validDay = this.day <= 30;

        const validMonth = this.month <= 12 && this.month >= 1;
        const validYear = this.year <= this.maxYear && this.year >= this.minYear;
        const isValid = validDay && validMonth && validYear;

        const isFullCompleted = this.inputs.filter(input => input.value).length === 3;
        if (isFullCompleted) {
            if (isValid) {
                this.rootElem.classList.remove("__uncompleted");
                if (this.datesBlock) this.datesBlock.classList.remove("__uncompleted");
                this.rootElem.classList.remove("__wrong-value");
            } else {
                this.rootElem.classList.add("__uncompleted");
                if (this.datesBlock) this.datesBlock.classList.add("__uncompleted");
                this.rootElem.classList.add("__wrong-value");

                // отобразить сообщение о неверно указанной дате
                let string = "";
                if (!validDay) {
                    if (validMonth) string = "Неверно указан день";
                    else string = "Неверно указан день, месяц";
                } else if (!validMonth) string = "Неверно указан месяц";

                if (!validYear && validDay && validMonth)
                    string += `Неверно указан год. Минимальное значение - ${this.minYear}, максимальное - ${this.maxYear}.`
                else if (!validYear) string += ` и год. Минимальное значение года - ${this.minYear}, максимальное - ${this.maxYear}`;

                const textBlock = this.wrongValueMessageBlock.querySelector(".wrong-value__text");
                textBlock.innerHTML = string;
            }
        }

        return { validDay, validMonth, validYear, isValid };
    }
}

class BirthdateInput extends DateInput {
    constructor(node) {
        super(node);

        this.getAgeAndZodiacClasses();
        this.zodiacSigngs = [
            { name: "Водолей", startMonth: 1, startDay: 21, endDay: 18, iconName: "aquarius" },
            { name: "Рыбы", startMonth: 2, startDay: 19, endDay: 20, iconName: "pisces" },
            { name: "Овен", startMonth: 3, startDay: 21, endDay: 19, iconName: "aries" },
            { name: "Телец", startMonth: 4, startDay: 20, endDay: 20, iconName: "taurus" },
            { name: "Близнецы", startMonth: 5, startDay: 21, endDay: 20, iconName: "gemini" },
            { name: "Рак", startMonth: 6, startDay: 21, endDay: 22, iconName: "cancer" },
            { name: "Лев", startMonth: 7, startDay: 23, endDay: 22, iconName: "leo" },
            { name: "Дева", startMonth: 8, startDay: 23, endDay: 22, iconName: "virgo" },
            { name: "Весы", startMonth: 9, startDay: 23, endDay: 22, iconName: "libra" },
            { name: "Скорпион", startMonth: 10, startDay: 23, endDay: 21, iconName: "scorpio" },
            { name: "Стрелец", startMonth: 11, startDay: 22, endDay: 21, iconName: "sagittarius" },
            { name: "Козерог", startMonth: 12, startDay: 22, endDay: 20, iconName: "capicorn" },
        ];
    }
    getMinmaxYears() {
        this.minYear = this.currentYear - 90;
        this.maxYear = this.currentYear - 14;
    }
    onInputBlurOrChange() {
        super.onInputBlurOrChange();
        this.setZodiacAndAge();
    }
    getAgeAndZodiacClasses() {
        setTimeout(() => {
            this.zodiacInput = inittedInputs.find(inpParams => {
                if (inpParams instanceof TextInput == false) return;
                return inpParams.rootElem.classList.contains("text-input--zodiac");
            });
            this.ageInput = inittedInputs.find(inpParams => {
                if (inpParams instanceof TextInput == false) return;
                return inpParams.rootElem.classList.contains("text-input--age");
            });
        }, 0);
    }
    validateDate() {
        const isValid = super.validateDate("Пожалуйста, укажите корректную дату рождения.")
            .isValid;

        return { isValid };
    }
    setZodiacAndAge() {
        const zodiac = this.zodiacSigngs
            .filter(zs => zs.startMonth == this.month || zs.startMonth + 1 == this.month)
            .find((zs, index, array) => {
                const nextZs = array[index + 1];
                if (nextZs) {
                    if (this.day >= zs.startDay && this.day <= nextZs.endDay) return true;
                    if (this.day < zs.startDay) return true;
                } else return true;
            });
        const zodiacValue = zodiac ? zodiac.name : "";
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentDay = currentDate.getDate() + 1;

        let age = currentDate.getFullYear() - this.year;
        if (this.month > currentMonth) age--;
        else if (this.month === currentMonth && this.day > currentDay) age--;

        if (!zodiacValue || !age || !this.validateDate()) {
            this.unsetZodiacAndAge();
            return
        };


        let zodiacSvg = this.zodiacInput.input.parentNode.querySelector("svg");
        if (!zodiacSvg) {
            zodiacSvg = `<svg><use xlink:href="#"></use></svg>`;
            this.zodiacInput.input.parentNode.insertAdjacentHTML("afterbegin", zodiacSvg);
            zodiacSvg = this.zodiacInput.input.parentNode.querySelector("svg");
        }
        zodiacSvg.querySelector("use").setAttribute("xlink:href", `#${zodiac.iconName}`);
        this.zodiacInput.rootElem.classList.add("text-input--with-icon");

        this.zodiacInput.input.value = zodiacValue;
        this.ageInput.input.value = age;
        this.zodiacInput.input.dispatchEvent(new Event("change"));
        this.ageInput.input.dispatchEvent(new Event("change"));
    }
    unsetZodiacAndAge() {
        const zodiacSvg = this.zodiacInput.input.parentNode.querySelector("svg");
        if (zodiacSvg) zodiacSvg.remove();
        this.zodiacInput.rootElem.classList.remove("text-input--with-icon");

        this.zodiacInput.input.value = "";
        this.ageInput.input.value = "";
        this.zodiacInput.input.dispatchEvent(new Event("change"));
        this.ageInput.input.dispatchEvent(new Event("change"));
    }
    checkCompletion() {
        super.checkCompletion("Пожалуйста, укажите дату рождения");
        return this.isCompleted;
    }
}

class RadioWrapper {
    constructor(node) {
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-required");
        this.inputs = this.rootElem.querySelectorAll("input[type='radio']");

        this.inputs.forEach(inp => inp.addEventListener("change", this.onChange));
    }
    checkCompletion() {
        const checked = this.rootElem.querySelector("input:checked");
        this.isCompleted = Boolean(checked);
        return this.isCompleted;
    }
    onChange() {
        const checked = this.rootElem.querySelector("input:checked");
        if (checked) this.rootElem.classList.remove("__uncompleted");
    }
}

class PageInputButtons {
    constructor(node) {
        this.onChange = this.onChange.bind(this);
        this.checkCompletion = this.checkCompletion.bind(this);
        this.handleRequiredListOrItem = this.handleRequiredListOrItem.bind(this);

        this.rootElem = node;
        this.isRequired = true;
        this.lists = Array.from(this.rootElem.querySelectorAll(".page-input-buttons__list"));
        this.requiredLists = this.lists.filter(list => list.hasAttribute("data-required"));
        this.requiredItems =
            Array.from(this.rootElem.querySelectorAll(".page-input-buttons__list .page-input-buttons__item"))
                .filter(item => item.hasAttribute("data-required"));
        this.allRequired = this.requiredLists.concat(this.requiredItems);

        this.rootElem.querySelectorAll(".page-input-buttons__item")
            .forEach(item => {
                item.addEventListener("change", this.onChange);
            });
    }
    checkCompletion() {
        this.requiredLists.forEach(this.handleRequiredListOrItem);
        this.requiredItems.forEach(this.handleRequiredListOrItem);
        const hasUncompleted = this.allRequired.find(req => req.classList.contains("__uncompleted"));
        if (hasUncompleted) {
            this.rootElem.classList.add("__uncompleted");
            this.isCompleted = false;
        } else {
            this.rootElem.classList.remove("__uncompleted");
            this.isCompleted = true;
        }
        return this.isCompleted;
    }
    handleRequiredListOrItem(reqListOrItem) {
        const hasCheckedInput = Boolean(
            reqListOrItem.querySelector("input:checked")
        );
        const tagsList = reqListOrItem.querySelector(".tags-list");
        if (tagsList) {
            const tagsListObserver = new MutationObserver(this.checkCompletion);
            tagsListObserver.observe(tagsList, { childList: true, subtree: true });

            const hasTags = Boolean(tagsList.querySelector(".tags-list__item"));
            if (hasCheckedInput && hasTags) {
                reqListOrItem.classList.remove("__uncompleted");
                tagsListObserver.disconnect();
            } else reqListOrItem.classList.add("__uncompleted");
        } else {
            if (hasCheckedInput) reqListOrItem.classList.remove("__uncompleted");
            else reqListOrItem.classList.add("__uncompleted");
        }
    }
    onChange() {
        if (this.rootElem.classList.contains("__uncompleted")) this.checkCompletion();
    }
}

class AddFieldButton {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        if (this.rootElem.closest("[data-addfield-hide]")) return;

        this.counter = 2;
        this.addedFields = [];

        this.getData();
        this.setInitialAmount();
        this.rootElem.addEventListener("click", this.onClick);
    }
    setInitialAmount() {
        if (this.params.initialAmount) {
            setTimeout(() => {
                const amount = parseInt(this.params.initialAmount);
                if (amount > 0) {
                    for (let i = 0; i < amount; i++) this.addField(true);
                }
            }, 0);
        }
    }
    getData() {
        const addData = this.rootElem.dataset.addField.split("; ");
        this.insertToBlock = findClosest(this.rootElem, addData[2]);
        const maxFieldsRepeat = parseInt(addData[1]);
        this.maxFieldsRepeat = maxFieldsRepeat > 0 ? maxFieldsRepeat : 1;
        this.isBefore = addData[3] === "true";

        const selectors = addData[0];
        if (selectors.startsWith("{") && selectors.endsWith("}")) {
            const string = selectors.replace("{", "").replace("}", "");
            this.selectors = string.split(", ");
            this.cloneRefList = this.selectors.map(selector => findClosest(this.rootElem, selector));
            this.cloneRefList.forEach(handleCloneRef);
        } else {
            this.selectors = selectors;
            this.cloneRef = findClosest(this.rootElem, this.selectors);
            if (this.cloneRef) handleCloneRef(this.cloneRef);
        }

        const params = this.rootElem.dataset.params;
        if (params) this.params = assignPropertiesToObj(params.split("; "));
        else this.params = {};

        this.rootElem.removeAttribute("data-add-field");
        this.rootElem.removeAttribute("data-params");

        function handleCloneRef(cloneRef) {
            if (cloneRef.hasAttribute("data-addfield-hide")) {
                cloneRef.remove();
                setTimeout(() => {
                    cloneRef.removeAttribute("data-addfield-hide");
                }, 0);
            }
        }
    }
    onClick() {
        this.addField();
    }
    addField(isInitial = false) {
        if (this.addedFields.length > this.maxFieldsRepeat) return;
        initField = initField.bind(this);

        // вставка одного поля
        if (this.cloneRef) {
            const field = this.cloneRef.cloneNode(true);
            initField(field);
            this.addedFields.push(field);
            if (!isInitial) {
                const removeButton = this.createRemoveButton();
                field.append(removeButton);
                removeButton.addEventListener("click", () => this.removeField(field));
            }

            const fieldClass = field.className.split(" ")[0];
            const addButton = field.querySelector(`.${fieldClass} > .add`);
            if (addButton) addButton.remove();
        }
        // вставка нескольких полей
        else if (this.cloneRefList) {
            const fields = this.cloneRefList.map(cloneRef => cloneRef.cloneNode(true));
            fields.forEach(field => initField(field));
            this.addedFields.push(fields);
            if (!isInitial) {
                const removeButton = this.createRemoveButton();
                removeButton.addEventListener("click", () => {
                    this.removeField(fields[0]);
                    removeButton.remove();
                });
                fields[0].parentNode.append(removeButton);
            }

            fields.forEach(fd => {
                const fdClass = fd.className.split(" ")[0];
                const addButton = fd.querySelector(`.${fdClass} > .add`);
                if (addButton) addButton.remove();
            });
        }

        if (this.addedFields.length >= this.maxFieldsRepeat) this.rootElem.classList.add("none");
        if (this.params.showNumeration === "true" && this.addedFields.length > 1) this.setNumeration();

        function initField(field) {
            this.replaceUniqueAttributes(field);
            this.replaceValue(field);

            if (this.insertToBlock) {
                if (this.isBefore) this.insertToBlock.before(field);
                else this.insertToBlock.after(field);
            }
            else this.rootElem.before(field);
        }
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
                newValue = originValue.trim().replace(/\d\b/, "");
                if (newValue[newValue.length - 1] === "-") {
                    const v = newValue.split("");
                    v[newValue.length - 1] = "";
                    newValue = v.join("");
                }
                newValue += "-" + this.counter.toString();
            }

            node.setAttribute(attr, newValue);
        }
    }
    replaceValue(field) {
        const type = field.getAttribute("type");
        if (typeof field.value === "string" && type) {
            if (type !== "text" && type !== "number") return;

            field.value = "";
        }

        field.querySelectorAll("input").forEach(inp => {
            const type = inp.getAttribute("type");
            if (type !== "text" && type !== "number" && type !== "email" && type !== "tel") return;

            inp.value = "";
        });
    }
    createRemoveButton() {
        let removeButtonLayout = "";
        const removeText = this.params.removeText || this.params.removeText === ""
            ? this.params.removeText
            : "Удалить";
        switch (this.params.removeIconName) {
            case "trash-can":
                removeButtonLayout = `
                <svg class="mr-10" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#b83539" viewBox="0 0 800 800">
                    <rect x="300" y="300" width="50" height="300"/>
                    <rect x="450" y="300" width="50" height="300"/>
                    <path d="M100,150v50h50V700a50,50,0,0,0,50,50H600a50,50,0,0,0,50-50V200h50V150ZM200,700V200H600V700Z"/>
                    <rect x="300" y="50" width="200" height="50"/>
                <rect fill="none"  width="50" height="50"/>
                </svg>
                <span class="add-text">${removeText}</span>
                `
                break;
            default:
                removeButtonLayout = `
                    <svg class="add__plus mr-10">
                        <use xlink:href="#minus-circle"></use>
                    </svg>
                    <span class="add__text">${removeText}</span>
                `
                break;
        }
        const removeButton =
            createElement("button", "add__button remove first-minus remove-field", removeButtonLayout);
        removeButton.setAttribute("type", "button");

        return removeButton;
    }
    setNumeration() {
        this.addedFields.forEach((field, index) => {
            const num = index + 1;
            const before = this.params.numerationBefore || "";
            const after = this.params.numerationAfter || "";
            const text = `${before} ${num.toString()} ${after}`;
            let title = field.querySelector(".bordered-block__numeration");
            if (!title) {
                title = createElement("h4", "bordered-block__numeration");
                field.prepend(title);
            }
            title.innerHTML = "";
            title.insertAdjacentHTML("afterbegin", text);
        });
    }
    removeNumeration() {
        this.addedFields.forEach(field => {
            const title = field.querySelector(".bordered-block__numeration");
            if (title) title.remove();
        });
    }
    removeField(field) {
        inittedInputs = inittedInputs.filter(inpParams => {
            const classSelector = field.className.split(" ")[0];
            const isRemovable = inpParams.rootElem === field
                || inpParams.rootElem.closest(`.${classSelector}`) === field;
            return !isRemovable;
        });

        let index = this.addedFields.indexOf(field);
        if (index < 0) index = this.addedFields.findIndex(arr => arr.includes(field));
        const nextFields = this.addedFields.filter((f, i) => i > index);
        // вычесть "1" из всех последующих за удаляемым полей
        nextFields.forEach(nextF => {
            if (Array.isArray(nextF)) nextF.forEach(f => this.replaceUniqueAttributes(f, true));
            else this.replaceUniqueAttributes(nextF, true);
        });

        // удалить поле или поля, если их несколько
        const fieldItem = this.addedFields[index];
        if (Array.isArray(fieldItem)) fieldItem.forEach(f => f.remove());
        else fieldItem.remove();

        this.addedFields.splice(index, 1);
        this.counter--;
        if (this.addedFields.length < this.maxFieldsRepeat) this.rootElem.classList.remove("none");

        if (this.addedFields.length > 1 && this.params.showNumeration) this.setNumeration();
        if (this.addedFields.length < 1) this.removeNumeration();
    }
}

class AddFieldByInput {
    constructor(node) {
        this.onChange = this.onChange.bind(this);
        initOnApply = initOnApply.bind(this);
        initOnChange = initOnChange.bind(this);

        this.rootElem = node;
        const key = this.rootElem.dataset.addfieldInput;
        const name = this.rootElem.getAttribute("name");
        const creatingElems = Array.from(
            document.querySelectorAll(`[data-addfield-input-target="${key}"]`)
        );
        this.creatingElems = creatingElems.map(elem => {
            return { elem, anchor: createElement("div", "none") };
        });

        // если находится внутри селекта с чекбоксами, у которого применение только по нажатию кнопки, поставить обработчик не на событие "change", а на событие "click" для кнопки "применить"
        if (this.rootElem.closest(".selects-input-checkbox")) initOnApply();
        // иначе поставить обработчик просто на событие "change" чекбокса
        else initOnChange();

        function initOnChange() {
            const otherInputs = document.querySelectorAll(`input[name="${name}"]`);

            this.onChange();
            this.rootElem.addEventListener("change", this.onChange);
            otherInputs.forEach(inp => inp.addEventListener("change", this.onChange));
        }
        function initOnApply(isRecursed = false) {
            setTimeout(() => {
                const selectParams = inittedInputs.find(inpParams => {
                    if (!inpParams.checkboxes
                        || !inpParams.rootElem.className.includes("selects-input-checkbox")
                    ) return false;
                    return inpParams.checkboxes.includes(this.rootElem);
                });
                // так как родительский селект для этого чекбокса может появиться только на следующей итерации функции initInputs, нужно прождать до следующей итерации этой функции
                if (!selectParams) {
                    if (!isRecursed) setTimeout(() => initOnApply(true), 500);
                    if (isRecursed) initOnChange();
                    return;
                }

                if (selectParams.applyButton) {
                    selectParams.rootElem.addEventListener("select-change", this.onChange);
                    this.onChange();
                }
                else initOnApply();
            }, 0);
        }
    }
    onChange() {
        this.rootElem.checked
            ? this.add()
            : this.remove();
    }
    remove() {
        this.creatingElems.forEach(elemData => {
            elemData.elem.replaceWith(elemData.anchor);
        });
    }
    add() {
        this.creatingElems.forEach(elemData => {
            elemData.anchor.replaceWith(elemData.elem);
        });
    }
}

class MapBlock {
    constructor(node) {
        this.lazyLoading = this.lazyLoading.bind(this);
        this.init = this.init.bind(this);
        this.getAddr = this.getAddr.bind(this);

        this.rootElem = node;
        this.selectsContainer = this.rootElem.querySelector(".map-block__selects");
        this.mapContainer = this.rootElem.querySelector(".map-block__map");
        this.selects = findInittedInput(".text-input", true)
            .filter(inpParams => {
                return inpParams.rootElem.closest(".map-block__selects") === this.selectsContainer;
            });

        window.addEventListener("scroll", this.lazyLoading);
    }
    lazyLoading() {
        const scrollY = window.pageYOffset;
        const mapY = getCoords(this.mapContainer).top;
        const isInBorders = Math.abs(scrollY - mapY) <= 2000;
        if (isInBorders && !this.isMapLoaded) this.loadMap();
    }
    loadMap() {
        if (this.isMapLoaded) return;

        const script = createElement("script");
        script.setAttribute("id", "maps-script");
        script.src = "https://api-maps.yandex.ru/2.1/?apikey=efe91807-ee6e-42c4-a379-25a218dcf1e7&lang=ru_RU";
        if (document.querySelector("#maps-script")) {
            this.isMapLoaded = true;
            return;
        }

        document.head.append(script);
        this.isMapLoaded = true;
        window.removeEventListener("scroll", this.lazyLoading);
        script.onload = () => { ymaps.ready(this.init); };
    }
    init() {
        this.map = new ymaps.Map("map", {
            center: [56.32687342, 44.00291063],
            zoom: 12
        });
        this.initSearchInputs();
    }
    initSearchInputs() {
        findByClassName = findByClassName.bind(this);
        handlePrompt = handlePrompt.bind(this);

        this.citySearchParams = inittedInputs.find(inpParams => {
            return findByClassName(inpParams, "map-block__region");
        });
        this.streetSearchParams = inittedInputs.find(inpParams => {
            return findByClassName(inpParams, "map-block__street");
        });
        this.houseSearchParams = inittedInputs.find(inpParams => {
            return findByClassName(inpParams, "map-block__house");
        });

        // получает через api подсказки и выставляет их в input'ы
        this.citySearchParams.input.addEventListener("input", setCityPrompt.bind(this));
        this.streetSearchParams.input.addEventListener("input", setStreetPrompt.bind(this));
        this.houseSearchParams.input.addEventListener("input", setHousePrompt.bind(this));

        // инициализация опциаональных input'ов
        initOptionalInputs.call(this);

        // получает адрес и делает запрос к яндекс картам
        this.citySearchParams.input.addEventListener("change", this.getAddr);
        this.streetSearchParams.input.addEventListener("change", this.getAddr);
        this.houseSearchParams.input.addEventListener("change", this.getAddr);

        function initOptionalInputs() {
            const inittedOptionals = [];
            const mapBlockObserver = new MutationObserver(onMutation.bind(this));
            mapBlockObserver.observe(this.rootElem, { childList: true, subtree: true });

            function onMutation() {
                setTimeout(() => {
                    const inputsSearchParams = {
                        // должны иметь такие же названия ключей, как this[key + "SearchParams"]
                        cityDistrict: {
                            el: inittedInputs.find(inpParams => {
                                return findByClassName(inpParams, "map-block__city-district");
                            }),
                            handler: setCityDistrictPrompt,
                        },
                        underground: {
                            el: inittedInputs.find(inpParams => {
                                return findByClassName(inpParams, "map-block__underground");
                            }),
                            handler: setUndergroundPrompt
                        }
                    };

                    for (let key in inputsSearchParams) {
                        const obj = inputsSearchParams[key];
                        const inputParams = obj.el;
                        if (!inputParams) continue;
                        if (inittedOptionals.includes(key)) continue;

                        this[`${key}SearchParams`] = inputParams;
                        inputParams.input.addEventListener("input", obj.handler.bind(this));
                        inittedOptionals.push(key);
                    }
                }, 0);
            }
        }
        function findByClassName(inpParams, className) {
            const input = inpParams.input;
            if (!input) return false;

            const isChild = input.closest(".map-block") === this.rootElem;
            const hasClassName = inpParams.input.classList.contains(className);
            return hasClassName && isChild;
        }
        function handlePrompt(query, params = {}) {
            /*
                queryResponse в названиях переменных означает city, street, house
                значения внутри params:
                dataKey: ключ в json.suggestions[obj].data[dataKey]
                replaceInString: то, что нужно заменять в найденной строке (например, "г ")
                inputParams: параметры input - this.citySearchParams, this.streetSearchParams, ...
                returnDataWithQueryResponses: false|true, возвращать ли полученные значения. По умолчанию - false, т.е. нет. Если возвращает эти значения, то метод editSelectValues не выполняется, т.к. подразумевается, что именно с этой целью (выполнить этот метод отдельно) параметр и передается
            */
            return new Promise(resolve => {
                this.getPrompt(query)
                    .then(json => {
                        const dataWithQueryResponses = json.suggestions.filter(obj => {
                            const queryResponse = getQueryResponse(params.dataKey, obj);
                            if (!queryResponse) return false;
                            return queryResponse;
                        });
                        const queryResponses = dataWithQueryResponses.map(obj => {
                            const queryResponse = getQueryResponse(params.dataKey, obj);
                            return queryResponse;
                        }).filter((queryResponse, index, arr) => arr.indexOf(queryResponse) === index);

                        if (params.returnDataWithQueryResponses) {
                            resolve(dataWithQueryResponses);
                            return;
                        };

                        params.inputParams.editSelectValues({
                            removeCurrentValues: true,
                            values: queryResponses
                        });
                    });
            });

            function getQueryResponse(keysOrKey, obj) {
                if (Array.isArray(keysOrKey)) {
                    let queryResponse = "";
                    keysOrKey.forEach(key => {
                        const s = obj.data[key];
                        queryResponse += s ? s + " " : "";
                    });
                    return queryResponse;
                } else return obj.data[keysOrKey];
            }
        }
        function setCityPrompt() {
            const query = this.citySearchParams.input.value;
            console.log(query);
            handlePrompt(query, {
                dataKey: "city_with_type",
                inputParams: this.citySearchParams,
                returnDataWithQueryResponses: true
            })
                .then(dataWithQueryResponses => {
                    const values = dataWithQueryResponses.map(response => {
                        console.log(response);
                        const regionType = response.data.region_with_type
                            .replace("обл", "область")
                            .replace("Респ", "Республика");
                        return response.data.city_with_type 
                            + " (" 
                            + regionType
                            + ")";
                    })
                    .filter((val, index, arr) => arr.indexOf(val) === index);
                    this.citySearchParams.editSelectValues({
                        removeCurrentValues: true,
                        values
                    })
                });
            setCityDistrictPrompt.call(this);
            setUndergroundPrompt.call(this);
        }
        function setStreetPrompt() {
            const cityValue = this.citySearchParams.input.value;
            const streetValue = this.streetSearchParams.input.value;
            if (!cityValue || !streetValue) return;

            const query = `${cityValue}, ${streetValue}`;
            handlePrompt(query, {
                dataKey: "street_with_type",
                inputParams: this.streetSearchParams
            });
        }
        function setHousePrompt() {
            const cityValue = this.citySearchParams.input.value;
            const streetValue = this.streetSearchParams.input.value;
            const houseValue = this.houseSearchParams.input.value;
            if (!cityValue || !streetValue || !houseValue) return;

            const query = `${cityValue}, ${streetValue}, ${houseValue}`;
            handlePrompt(query, {
                dataKey: ["house_type", "house", "block_type", "block"],
                inputParams: this.houseSearchParams
            });
        }
        function setCityDistrictPrompt() {
            if (!this.cityDistrictSearchParams) return;
            if (!this.cityDistrictSearchParams.input.closest("body")) return;

            const cityValue = this.citySearchParams.input.value;
            const cityDistrictValue = "р-н";
            if (!cityValue) return;

            const query = `${cityValue} ${cityDistrictValue}`;
            handlePrompt(query, {
                dataKey: "city_district",
                inputParams: this.cityDistrictSearchParams
            });
        }
        function setUndergroundPrompt() {
            if (!this.undergroundSearchParams) return;
            if (!this.undergroundSearchParams.input.closest("body")) return;

            const cityValue = this.citySearchParams.input.value;
            if (!cityValue) return;

            const query = `${cityValue} метро `;
            this.getPrompt(query).then(json => {
                const undergroundResponses = json.suggestions.filter(obj => {
                    return obj.data.street_type_full === "метро";
                });
                const undergroundTitles = undergroundResponses
                    .map(obj => obj.data.street_with_type.replace("метро ", ""))
                    .filter((title, index, arr) => arr.indexOf(title) === index);

                this.undergroundSearchParams.editSelectValues({
                    removeCurrentValues: true,
                    values: undergroundTitles
                });
            });
        }
    }
    getPrompt(query) {
        return new Promise((resolve, reject) => {
            fetchMapData(query)
                .then(json => resolve(json))
                .catch(err => reject(err));
        });
    }
    getAddr() {
        let city = this.citySearchParams.input.value.trim();
        let street = this.streetSearchParams.input.value.trim() || "";
        let house = this.houseSearchParams.input.value.trim() || "";

        if (!city) return;
        if (city && (street || house)) city += ", ";
        if (street && house) street += ", ";

        let addrValue = city + street + house;
        if (!addrValue) return;

        ymaps.geocode(addrValue, { results: 1 }).then(res => {
            this.map.geoObjects.removeAll();
            const result = res.geoObjects.get(0);
            const bounds = result.properties.get("boundedBy");

            this.map.geoObjects.add(result);
            this.map.setBounds(bounds, { checkZoomRange: true });
        });
    }
}

class BorderedBlockSchedule {
    constructor(node) {
        this.setInputHandlers = this.setInputHandlers.bind(this);

        this.rootElem = node;
        this.haveSetHandler = [];

        this.setInputHandlers();
        const borderedBlockObserver = new MutationObserver(this.setInputHandlers);
        borderedBlockObserver.observe(this.rootElem, { childList: true, subtree: true });
    }
    setInputHandlers() {
        this.inputsParams = inittedInputs.filter(inpParams => {
            const exception = inpParams instanceof TimeScheduleInput;
            return !exception
                && inpParams.input
                && inpParams.input.closest(".bordered-block") === this.rootElem;
        });
        this.inputsParams.forEach(inpParams => {
            const input = inpParams.input;
            if (!this.haveSetHandler.includes(input)) {
                input.addEventListener("change", () => {
                    const resVac = findInittedInput(".res-vac-preview");
                    resVac.setInfo();
                });
                this.haveSetHandler.push(input);
            }
        });
    }
}

class ToggleOnchecked {
    constructor(node) {
        this.onChange = this.onChange.bind(this);
        this.onMutation = this.onMutation.bind(this);
        getSettingValue = getSettingValue.bind(this);

        this.rootElem = node;
        const options = this.rootElem.dataset.toggleOnchecked.split(", ");
        this.data = assignPropertiesToObj(options);
        this.showBlock = {
            value: getSettingValue(this.data.inputShowValue),
            node: findClosest(this.rootElem, this.data.show),
            anchor: createElement("div", "none")
        };
        this.hideBlock = {
            value: getSettingValue(this.data.inputHideValue),
            node: findClosest(this.rootElem, this.data.hide),
            anchor: createElement("div", "none")
        };
        if (!this.showBlock.node) this.showBlock = null;
        if (!this.hideBlock.node) this.hideBlock = null;

        this.rootElem.removeAttribute("data-toggle-onchecked");
        this.rootElem.addEventListener("change", this.onChange);
        if (this.rootElem.type === "radio") {
            const name = this.rootElem.getAttribute("name");
            const otherInputs = document.querySelectorAll(`[name="${name}"]`);
            otherInputs.forEach(inp => inp.addEventListener("change", this.onChange));
        }
        const observer = new MutationObserver(this.onMutation);
        observer.observe(document.body, { childList: true, subtree: true });
        this.toggle();

        function getSettingValue(dataValue) {
            if (!dataValue) return null;
            const selectorsStartSymbols = ["#", ".", "["];

            if (selectorsStartSymbols.includes(dataValue[0])) {
                const input = document.querySelector(dataValue);
                if (!input) return null;
                return input;
            }

            return dataValue;
        }
    }
    onMutation() {
        if (!this.rootElem.closest("body")) this.hide();
        else this.onChange();
    }
    onChange() {
        this.checked = this.rootElem.checked;
        this.toggle();
    }
    toggle() {
        this.checked
            ? this.show()
            : this.hide();
    }
    show() {
        if (this.showBlock && this.showBlock.anchor.closest("body")) {
            this.showBlock.anchor.replaceWith(this.showBlock.node);
            if (this.showBlock.value) this.setInputValue(this.showBlock);
        }

        if (this.hideBlock) this.hideBlock.node.replaceWith(this.hideBlock.anchor);
    }
    hide() {
        if (this.hideBlock && this.hideBlock.anchor.closest("body")) {
            this.hideBlock.anchor.replaceWith(this.hideBlock.node);
            if (this.hideBlock.value) this.setInputValue(this.hideBlock);
        }

        if (this.showBlock) this.showBlock.node.replaceWith(this.showBlock.anchor);
    }
    setInputValue(block) {
        const input = block.node.querySelector("input");
        if (!input) return;

        const inputOrValue = block.value;
        input.value = typeof inputOrValue === "string"
            ? block.value
            : block.value.value || "";
        input.dispatchEvent(new Event("input"));
    }
}

class CreatePopup {
    constructor(node) {
        this.createPopup = this.createPopup.bind(this);
        this.initPopup = this.initPopup.bind(this);

        this.rootElem = node;
        const dataset = this.rootElem.dataset.createPopup;
        if (!dataset)
            throw new Error("Не указаны параметры data-create-popup");
        this.popupData = dataset.split(", ");
        this.popupName = this.popupData[0];
        this.popupParams = assignPropertiesToObj(this.popupData[1].split("; "));
        this.popupParamsRoot = this.popupParams;
        if (this.popupParams.initOnLoad) {
            setTimeout(() => {
                this.initPopup(true);
                if (this.popupParams.initOnLoad === "close") this.popup.remove();
            }, 0);
        }
        this.rootElem.removeAttribute("data-create-popup");

        const type = this.rootElem.getAttribute("type");
        switch (type) {
            case "checkbox":
            case "radio":
                this.initInputButton();
                this.rootElem.parentNode.addEventListener("click", () => this.initPopup());
                break;
            default:
                this.initClickableButton();
                break;
        }
    }
    initInputButton() {
        const name = this.rootElem.getAttribute("name");
        const inputs = document.querySelectorAll(`input[name="${name}"]`);
        this.otherInputs = [];
        inputs.forEach(inp => {
            inp.addEventListener("change", () => {
                if (this.rootElem.checked) this.initPopup();
            });
            if (inp === this.rootElem) return;

            inp.addEventListener("change", () => this.onOtherInputChange(inp));
            let inputPopupParams = inp.dataset.popupParams ? inp.dataset.popupParams.trim() : "";
            if (inputPopupParams.endsWith(";")) inputPopupParams = inputPopupParams.slice(0, -1);
            this.otherInputs.push({ input: inp, params: inputPopupParams });
            inp.removeAttribute("data-popup-params");
            setTimeout(() => {
                if (inp.checked) inp.dispatchEvent(new Event("change"));
            }, 250);
        });
    }
    initClickableButton() {
        this.rootElem.addEventListener("click", () => this.initPopup());
    }
    createPopup() {
        const selectName = this.popupParams.selectName;
        switch (this.popupName) {
            case "standard":
            default:
                this.popup = new Popup();
                break;
            case "select-tags":
                const selectTagInner = `
                    <h3 class="popup__title">
                        ${this.popupParams.title}
                    </h3>
                    <div class="selects-input-checkbox selects-input-checkbox--regions" data-unset-max-height data-tags-select="${selectName}" data-params="regionsOnly:${this.popupParams.regionsOnly || "false"}; citiesOnly:${this.popupParams.citiesOnly || "false"}">
                    <div class="selects-input-checkbox__wrapper">
                        <input class="selects-input-checkbox__input" type="text" name="${selectName}">
                        <span class="arrow"></span>
                        <span class="cross">
                            <svg>
                                <use xlink:href="#cross-icon"></use>
                            </svg>
                        </span>
                        <div class="prompt-hover__open">Очистить поле?</div>
                        <div class="selects-wrap-checkbox" style="padding: 0px; margin: 0px;"></div>
                    </div>
                `;
                this.popup = new Popup({ popupInner: selectTagInner });
                let defaultValues = this.popupParams.defaultValues;
                if (defaultValues) {
                    defaultValues = defaultValues.split("|");
                    setTimeout(() => {
                        const selectParams = inittedInputs.find(inpParams => {
                            const popupNode = this.popup.rootElem;
                            const ischeckboxeselect = inpParams instanceof TextInputCheckboxes;
                            const isPopupChild = inpParams.rootElem.closest(".popup") === popupNode;
                            return ischeckboxeselect && isPopupChild;
                        });
                        if (!selectParams) return;

                        defaultValues.forEach(defValue => selectParams.setValue(defValue));
                    }, 100);
                }
                break;
            case "select-single-tag":
                const selectSingleOptionInner = `
                    <h3 class="popup__title">
                        ${this.popupParams.title}
                    </h3>
                    <div class="text-input text-input--regions text-input-area" data-tags-select="${selectName}" data-params="regionsOnly:${this.popupParams.regionsOnly || "false"}; citiesOnly:${this.popupParams.citiesOnly || "false"}">
                        <div class="text-input__wrapper">
                            <input class="text-input__input" type="text">
                            <div class="selects-wrap selects-wrap__max-width"></div>
                        </div>
                    </div>
                `;
                this.popup = new Popup({ popupInner: selectSingleOptionInner });
                break;
        }
    }
    onOtherInputChange(input) {
        const popupParamsString = this.otherInputs.find(i => i.input === input).params;
        if (!popupParamsString) return;
        popupParamsString.split("; ").forEach(prop => {
            const keyValue = prop.split(":");
            this.popupParams[keyValue[0]] = keyValue[1];
        });

        // если нет popup'а, то инициализировать его и перезапустить функцию
        if (!this.popup) {
            this.initPopup(true)
                .then(() => {
                    this.popup.remove();
                    this.onOtherInputChange(input);
                    return;
                });
        }
        const tagsList = document.querySelector(`[data-tags-list="${this.popupParams.selectName}"]`) || [];

        const afterSetTags = () => {
            if (!input.checked) return;
            if (this.popupParams.removeCrossFromTags) removeCrosses.call(this);
            if (this.popupParams.removeAllTags) removeTags.call(this);
        };

        if (this.popupParams.setTags) {
            setTimeout(() => setTags.call(this), 0);
            setTimeout(() => afterSetTags(), 500);
            return;
        }
        afterSetTags();
        function getTags() {
            return Array.from(tagsList.querySelectorAll(".tags-list__item"))
                .map(tag => {
                    return { tag, text: tag.querySelector(".tags-list__item-text").innerText }
                });
        }
        function setTags() {
            const tagsToSet = this.popupParams.setTags.split("|");
            const inputsParams = this.popup.inputsParams;
            if (!inputsParams) return;

            inputsParams.forEach(inpParams => {
                if (inpParams instanceof TextInputCheckboxes) {
                    tagsToSet.forEach(tagValue => inpParams.setValue(tagValue));
                }
            });
        }
        function removeTags() {
            const exceptions = this.popupParams.removeAllTags.split("|");
            const tags = getTags();
            tags.forEach(tagData => {
                if (exceptions.includes(tagData.text)) return;

                tagData.tag.querySelector(".tags-list__item-cross").dispatchEvent(new Event("click"));
            });
        }
        function removeCrosses() {
            returnCrosses = returnCrosses.bind(this);

            const tagsValues = this.popupParams.removeCrossFromTags.split("|");
            const tags = getTags();
            const tagsWithCrossRemoved = [];
            const removedCrosses = [];
            tagsValues.forEach(tValue => {
                const tagData = tags.find(t => t.text === tValue);
                if (!tagData) return;

                const tag = tagData.tag;
                const cross = tag.querySelector(".tags-list__item-cross");
                if (!cross) return;
                const anchor = createElement("div", "none");
                removedCrosses.push({ tag, cross, anchor });
                cross.replaceWith(anchor);
                tagsWithCrossRemoved.push(tag);
            });
            this.rootElem.addEventListener("change", returnCrosses);
            this.otherInputs.forEach(inpData => {
                if (inpData.input === input) return;

                inpData.input.addEventListener("change", returnCrosses);
            });

            function returnCrosses() {
                tagsWithCrossRemoved.forEach(tag => {
                    const crossData = removedCrosses.find(crData => crData.tag === tag);
                    crossData.anchor.replaceWith(crossData.cross);
                    this.rootElem.removeEventListener("change", returnCrosses);
                    this.otherInputs.forEach(inpData => {
                        inpData.input.removeEventListener("change", returnCrosses);
                    });
                });
            }
        }
    }
    initPopup(isInvisible = false) {
        if (this.rootElem.checked) this.popupParams = this.popupParamsRoot;
        return new Promise(resolve => {
            if (!this.popup) this.createPopup();
            this.popup.init(isInvisible)
                .then(inputsParams => resolve(inputsParams));
        });
    }
}

class AddPhoto {
    constructor(node) {
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        this.input = this.rootElem.querySelector(".add-photo__input");
        this.addPhotoWrapper = this.rootElem.querySelector(".add-photo__wrapper");
        this.infoBlock = this.rootElem.querySelector(".add-photo__info");
        this.button = this.rootElem.querySelector(".add-photo__button");
        this.images = [];

        this.input.addEventListener("change", this.onChange);
    }
    onChange() {
        const files = this.input.files;
        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
            const file = files[fileIndex];

            if (!file.type.startsWith("image/")) return;
            const size = calcSize(file.size);
            if (size.includes("мб") && size > 5) return;

            const img = new Image();
            img.onload = () => {
                const imgWrapper = createElement("div", "add-photo__loaded-image");
                const removeButtonInner = `<svg><use xlink:href="#cross-icon"></use></svg>`;
                const removeButton =
                    createElement("div", "add-photo__loaded-image-cross", removeButtonInner);
                removeButton.addEventListener("click", () => this.removeImage(fileIndex));
                imgWrapper.append(img);
                imgWrapper.append(removeButton);
                this.images.push({ img, fileIndex, imgWrapper });
                this.appendImages();

                if (fileIndex === 0) {
                    const resVac = findInittedInput(".res-vac-preview");
                    resVac.setInfo();
                }
            };

            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                img.src = readerEvent.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    appendImages() {
        this.toggleButton();

        this.images.forEach(imgData => {
            if (imgData.imgWrapper.closest("body")) return;

            this.addPhotoWrapper.append(imgData.imgWrapper);
        });
    }
    toggleButton() {
        if (this.images.length > 0) {
            this.infoBlock.classList.add("none");
            this.button.classList.add("none");
        } else {
            this.infoBlock.classList.remove("none");
            this.button.classList.remove("none");
        }
    }
    removeImage(fileIndex) {
        removeFromArray.call(this);
        removeFromFilesList.call(this);
        this.toggleButton();

        function removeFromArray() {
            const imgData = this.images.find(iData => iData.fileIndex == fileIndex);
            this.images = this.images.filter(iData => iData !== imgData);
            imgData.imgWrapper.remove();
        }
        function removeFromFilesList() {
            const dt = new DataTransfer();
            const files = this.input.files;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (i !== fileIndex) dt.items.add(file);
            }
            this.input.files = dt.files;
        }
    }
}

class Form {
    constructor(node) {
        this.onSubmit = this.onSubmit.bind(this);

        this.rootElem = node;
        this.rootElem.addEventListener("submit", this.onSubmit);
    }
    onSubmit(event) {
        event.preventDefault();

        const checkedRubricks = findInittedInput(".resume__rubricks").checked || [];
        const inputs = findInittedInputByFlag("inputParams", true)
            .filter(inpParams => inpParams.rootElem.closest("body"));
        const uncompleted = inputs.filter(inpParams => {
            const isRequired = inpParams.isRequired;
            if (!isRequired) return false;

            const isCompleted = inpParams.checkCompletion();
            return isCompleted ? false : true;
        });
        if (uncompleted.length > 0 || checkedRubricks.length < 1) {
            uncompleted.forEach(inpParams => {
                if (!inpParams.rootElem.closest("body")) return;

                inpParams.rootElem.classList.add("__uncompleted");
                if (inpParams.datesBlock) inpParams.datesBlock.classList.add("__uncompleted");
            });
            console.log(uncompleted, checkedRubricks);
        } else {
            console.log("Все нужные поля указаны!");
        }
    }
}

let inputsInittingSelectors = [
    { selector: "[data-add-field]", classInstance: AddFieldButton, flag: "inputParams" },
    { selector: ".text-input--standard", classInstance: TextInput, flag: "inputParams" },
    { selector: ".text-input--regions", classInstance: TextInputRegions, flag: "inputParams" },
    { selector: ".text-input--phone", classInstance: TextInputPhone, flag: "inputParams" },
    { selector: ".text-input--date", classInstance: DateInput, flag: "inputParams" },
    { selector: ".text-input--birthdate", classInstance: BirthdateInput, flag: "inputParams" },
    { selector: ".time-schedule__select", classInstance: TimeScheduleInput, flag: "inputParams" },
    { selector: ".time-schedule__item", classInstance: TimeScheduleItem, flag: "inputParams" },
    { selector: ".time-schedule", classInstance: TimeScheduleList, flag: "inputParams" },
    { selector: ".add__button--rubrick", classInstance: ScrollToRubricksButton, flag: "inputParams" },
    { selector: ".textarea-wrapper", classInstance: Textarea, flag: "inputParams" },
    { selector: ".tags-list", classInstance: TagsList, flag: "inputParams" },
    { selector: "[data-checkboxes-bind]", classInstance: CheckboxesBind, flag: "inputParams" },
    { selector: "[data-addfield-input]", classInstance: AddFieldByInput, flag: "inputParams" },
    { selector: ".map-block", classInstance: MapBlock, flag: "inputParams" },
    { selector: ".bordered-block--schedule", classInstance: BorderedBlockSchedule, flag: "inputParams" },
    { selector: "[data-toggle-onchecked]", classInstance: ToggleOnchecked, flag: "inputParams" },
    { selector: "[data-create-popup]", classInstance: CreatePopup, flag: "inputParams" },
    {
        selector: ".selects-input-checkbox--standard",
        classInstance: TextInputCheckboxes,
        flag: "inputParams"
    },
    {
        selector: ".selects-input-checkbox--regions",
        classInstance: TextInputCheckboxesRegion,
        flag: "inputParams"
    },
    { selector: ".radio-wrap", classInstance: RadioWrapper, flag: "inputParams" },
    { selector: ".page-input-buttons", classInstance: PageInputButtons, flag: "inputParams" },
    { selector: ".add-photo", classInstance: AddPhoto, flag: "inputParams" },
    { selector: "#form", classInstance: Form },
];
inittingSelectors = inittingSelectors.concat(inputsInittingSelectors);