/* ========================================= ОБЩИЕ СКРИПТЫ ========================================= */
const inittedInputs = [];

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
            document.querySelectorAll(`[name="rubrick-checkbox"]`)
        );
        this.checkboxesItems.forEach(cb => cb.addEventListener("change", this.onChange));
    }
    show() {
        this.rootElem.classList.remove("none");
    }
    onChange(event) {
        const targInput = event.target;
        console.log(targInput);
        if (!Array.isArray(this.checked)) this.checked = [];
        const options = findInittedInput("#options");

        forbidPassCheckLimit.call(this);
        if (this.checked.length > 0) toggleOptions(true);
        else toggleOptions(false);
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
        // перечисление рубрик обычным списком
        const blocks = this.rootElem.querySelectorAll(".rubricks-categories");
        const checkedRubricks = findInittedInput(".resume__rubricks").checked || [];
        const rubricksParams = findInittedInput(".resume__rubricks");
        blocks.forEach(block => {
            const blockSpan = block.querySelector("span");

            let blockSpanInner = "";
            checkedRubricks.forEach((inp, i, arr) => {
                blockSpanInner += inp.value;
                if (i != arr.length - 1) blockSpanInner += ", ";
            });
            blockSpan.innerHTML = blockSpanInner;
        });

        // дублирование чекбоксов рубрик в блоки
        const checkboxBlocks = document.querySelectorAll(".rubricks-checkboxes");
        checkboxBlocks.forEach(cbBlock => {
            let blockInner = "";
            checkedRubricks.forEach((inp) => {
                blockInner += `
                <label class="flex checkboxs__items_item">
                    <input name="rubrick-checkbox" class="mr-5 checkbox" type="checkbox" value="${inp.value}" checked>
                    <span class="checkmark">
                    <img src="img/checkmark.png" alt="checkmark">
                    <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                    </span>
                    <span class="text big-text">${inp.value}</span>
                </label>
                `;
            });
            cbBlock.innerHTML = blockInner;

            cbBlock.querySelectorAll('[name="rubrick-checkbox"').forEach(cb => {
                cb.addEventListener("change", () => {
                    const originCheckbox = rubricksParams.checkboxesItems
                        .find(originCb => originCb.value === cb.value);
                    if (originCheckbox) {
                        originCheckbox.checked = cb.checked;
                        originCheckbox.dispatchEvent(new Event("change"));
                    }
                });
            });
        });
    }
}

class PromotionData {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        this.text = this.rootElem.dataset.promotion;
        this.promotionOpenBlock = this.rootElem.querySelector(".prompt-hover-promotion__open");

        this.rootElem.addEventListener("click", this.onClick);
        if (this.promotionOpenBlock)
            this.promotionOpenBlock.insertAdjacentText("afterbegin", this.text);
    }
    onClick(event) {
        event.preventDefault();
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

        this.rootElem.addEventListener("click", this.onPopupClick);

        this.init();
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
        if (isInvisible) this.rootElem.classList.add("none");
        document.querySelector(".wrapper").append(this.rootElem);
        document.body.classList.add("__locked-scroll");
        setTimeout(() => this.setStyles("show"), 50);
    }
    remove() {
        this.setStyles("remove");
        document.body.classList.remove("__locked-scroll");
        setTimeout(() => {
            this.rootElem.remove();
            this.rootElem.classList.remove("none");
        }, this.transitionDuration);
    }
}

class PromotionBlock {
    constructor(node) {
        this.onOptionChange = this.onOptionChange.bind(this);

        this.rootElem = node;
        this.options = Array.from(this.rootElem.querySelectorAll("[data-promotion-option]"))
            .map(option => {
                let options = option.dataset.promotionOption;
                if (!options.includes("changeable")) option.removeAttribute("data-promotion-option");
                if (!options) return null;

                options = options.split(", ");
                const price = parseInt(options[0].split("|")[0]);
                const oldPrice = parseInt(options[0].split("|")[1]) || 0;
                const discount = oldPrice ? 100 - price / (oldPrice / 100) : false;
                const input = option.querySelector("input");
                const changeableInput = input.closest(".page__promotion_radio")
                    .querySelector(".page__promotion_amount-input");
                const changeable = options[1] === "changeable"
                    ? { input: changeableInput }
                    : false;

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
                const input = optData.input.closest(".page__promotion_checkbox")
                    .querySelector(".page__promotion_amount-input");
                const amount = parseInt(input.value.replace(/\D/g, ""));
                this.totalPrice += optData.price * amount;
            }
            else this.totalPrice += optData.price;
        });

        // выставить подсчет цены ДО скидки по бонусам
        const totalBlockData = this.totalPriceBlock.querySelector(".page__promotion_data");
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
                    <span class="mr-5 ml-5">${checkedOption.oldPrice || checkedOption.price}</span> 
                    р. 
                    ${checkedOption.discount ? `скидка ${checkedOption.discount}%` : ""}
                `
                : "ИТОГО:";

            return `
            <div class="total__item flex mb-15 your-checked">
                <div class="total__item_text small-text">
                    ${optionText}
                </div>
                <div class="total__item_number small-text">
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
        this.codeWordsBlock = this.rootElem.querySelector(".page__promotion_codes");
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
        this.input = this.rootElem.querySelector(".page__promotion_amount-input");
        this.buttonPlus = this.rootElem.querySelector(".page__promotion_amount-plus");
        this.buttonMinus = this.rootElem.querySelector(".page__promotion_amount-minus");
        this.min = this.input.getAttribute("min");
        this.max = this.input.getAttribute("max");
        this.totalBlock = this.rootElem.querySelector(".page__promotion_checkbox_total");

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
    { selector: ".resume__rubricks", classInstance: Rubricks },
    { selector: "#options", classInstance: Options },
    { selector: "#promotion", classInstance: PromotionBlock },
    { selector: "[data-promotion-option*='changeable']", classInstance: ChangeablePricePromotion },
    { selector: "[data-promotion]", classInstance: PromotionData },
    { selector: ".spoiler", classInstance: Spoiler },
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
            const inputParams = new classInstance(inittingNode);
            if (selectorData.flag) inputParams.instanceFlag = selectorData.flag;
            inittedInputs.push(inputParams);
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
        this.isRequired = this.rootElem.hasAttribute("data-required");
        this.errorMessage = this.rootElem.querySelector(".work-error");
        this.wrongValueMessageBlock = this.rootElem.querySelector(".text-input__wrong-value");
        this.selectsTransitionDur = 300;
        this.setMaxHeight = true;
        if (this.rootElem.hasAttribute("data-unset-max-height")) {
            this.rootElem.removeAttribute("data-unset-max-height");
            this.setMaxHeight = false;
        }


        this.getSelectsWrap();
        document.addEventListener("click", this.onDocumentClick);
    }
    getTagLists() {
        const tagsListName = this.rootElem.dataset.tagsSelect;
        if (tagsListName)
            return document.querySelectorAll(`[data-tags-list="${tagsListName}"]`);

        return null;
    }
    createControls() {
        Array.from(this.inputWrapper.querySelectorAll("div"))
            .concat(Array.from(this.inputWrapper.querySelectorAll("span")))
            .forEach(el => {
                const isException = el !== this.input
                    && !el.classList.contains("selects-wrap")
                    && !el.classList.contains("selects-wrap-checkbox")
                    && !el.closest(".selects-wrap")
                    && !el.closest(".selects-wrap-checkbox")
                if (isException) el.remove();
            });
        const controlsLayout = `
            <span class="arrow"></span>
            <span class="cross">
            <svg>
                <use xlink:href="#cross-icon"></use>
            </svg>
            </span>
            <div class="prompt-hover__open">Очистить поле?</div>
        `;
        this.inputWrapper.insertAdjacentHTML("beforeend", controlsLayout);

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

        this.checkCompletion(event);
    }
    onFocus() {
        this.openSelects();
    }
    onChange() {
        const value = this.input.value;
        if (this.maskData) {
            const userValue = this.getClearedFromMaskValue(value);
            if (!userValue) this.input.value = "";
        }
        this.rootElem.classList.remove("__wrong-value");
        this.checkCompletion();
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
            this.selectsWrap = null;
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
        if (!this.selectsWrap) return;

        this.rootElem.classList.remove("open-selects");
        this.selectsWrap.style.maxHeight = "0";
        this.selectsWrap.style.removeProperty("visibility");
        this.selectsWrap.style.overflow = "hidden";
        this.selectsWrap.style.cssText = "padding: 0; margin: 0;";
    }
    openSelects() {
        if (!this.selectsWrap) return;

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
        const value = this.input.value.toLowerCase().trim();
        const noMatch = !Boolean(this.selectValues.find(selVal => {
            const text = selVal.text.trim().toLowerCase();
            const val = this.input.value.toLowerCase().trim();
            return text.includes(val);
        }));
        noMatch && !value.includes("выбрано") && !value.includes("Выбрано")
            ? this.selectsWrap.classList.add("none")
            : this.selectsWrap.classList.remove("none");

        if (!fullMatch) {
            fullMatch = this.selectValues.find(selVal => {
                return selVal.text.toLowerCase().trim() === value;
            });
        }

        if (fullMatch) {
            this.selectValues.forEach(selVal => {
                selVal.node.classList.remove("none");
                this.setHighlightedText(selVal.text, selVal);
            });
        } else {
            this.selectValues.forEach(selVal => {
                const valText = selVal.text;
                const valTextMod = valText.toLowerCase().trim();
                if (valTextMod.includes(value)) {
                    selVal.node.classList.remove("none");
                    const substrPos = valTextMod.indexOf(value);
                    const substrEnd = substrPos + value.length;
                    let substr = valText.slice(0, substrPos)
                        + `<span class="highlight">${valText.slice(substrPos, substrEnd)}</span>`
                        + valText.slice(substrEnd);

                    this.setHighlightedText(substr, selVal);
                } else if (!this.input.value.includes("выбрано") && !this.input.value.includes("Выбрано")) {
                    selVal.node.classList.add("none");
                }
            });
        }
    }
    checkCompletion() {
        this.isCompleted = Boolean(this.rootElem.querySelector("input:checked"));
        return this.isCompleted;
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
        Array.from(this.inputWrapper.querySelectorAll("div"))
            .concat(Array.from(this.inputWrapper.querySelectorAll("span")))
            .forEach(el => {
                if (el !== this.input && !el.classList.contains("selects-wrap"))
                    el.remove();
            });
        const controlsLayout = `
            <span class="arrow"></span>
            <span class="cross">
            <svg>
                <use xlink:href="#cross-icon"></use>
            </svg>
            </span>
            <div class="prompt-hover__open">Очистить поле?</div>
        `;
        this.inputWrapper.insertAdjacentHTML("beforeend", controlsLayout);

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
            return { node: selVal, text: selVal.textContent.trim() || val.innerText };
        });
        this.selectValues.forEach(selVal => {
            selVal.node.addEventListener("click", () => {
                this.input.value = selVal.text;
                this.input.dispatchEvent(new Event("input"));
                this.input.dispatchEvent(new Event("change"));
                if (this.getTagLists()) this.addTag();
            });
        });
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

class TimeScheduleItem {
    constructor(node) {
        this.onCheckboxChange = this.onCheckboxChange.bind(this);
        this.onAddLunchClick = this.onAddLunchClick.bind(this);

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-required");
        this.inputs = Array.from(this.rootElem.querySelectorAll(".time-schedule__select"))
            .map((inp, index) => {
                const inittedTSParams = inittedInputs.find(inpParams => inpParams.rootElem === inp);
                const timeScheduleParams = inittedTSParams || new TimeScheduleInput(inp);
                if (index === 0) timeScheduleParams.setDefaultTime("00:30");
                if (index === 1) timeScheduleParams.setDefaultTime("19:00");

                return timeScheduleParams;
            });
        this.checkboxes = Array.from(
            this.rootElem
                .querySelectorAll(".time-schedule__checkbox input[type='checkbox']")
        );
        this.checkboxes.forEach(cb => {
            cb.addEventListener("change", this.onCheckboxChange);
            this.setCheckedCheckbox(cb);
        });
        this.addLunchButton = this.rootElem.querySelector(".time-schedule__button--lunch");

        if (this.addLunchButton) this.addLunchButton.addEventListener("click", this.onAddLunchClick);
    }
    onCheckboxChange(event) {
        const checkbox = event.target;
        setTimeout(() => this.setCheckedCheckbox(checkbox), 100);
    }
    setCheckedCheckbox(checkbox) {
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
        const newInputs = inittedInputs.filter(inpParams => {
            const isChild = inpParams.rootElem.closest(".time-schedule__item") === this.rootElem;
            const isInput = inpParams instanceof TimeScheduleInput;
            return isChild && isInput;
        }).filter(inpParams => !this.inputs.includes(inpParams));

        newInputs.forEach((inpParams, index) => {
            if (index === 0) inpParams.setDefaultTime("12:00");
            if (index === 1) inpParams.setDefaultTime("13:00");
        });
    }
}

class TimeScheduleInput extends TextInput {
    constructor(node) {
        super(node);

        this.createSelectOptions();
        this.createControls();
        this.init();
        this.input.addEventListener("input", this.typeNumbersOnly);
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

class TextInputRegions extends TextInput {
    constructor(node) {
        super(node);
        this.createControls();
        this.setRegions();
    }
    setRegions() {
        fetch("/vsevn-ad/json/regions.json")
            .then(data => data.json())
            .then(regions => {
                let innerhtml = "";
                if (!this.selectsWrap)
                    this.selectsWrap = this.rootElem.querySelector(".selects-wrap");
                regions.forEach(region => innerhtml += createItem(region));
                this.selectsWrap.innerHTML = "";
                this.selectsWrap.insertAdjacentHTML("afterbegin", innerhtml);

                this.getSelectsWrap();
            });

        function createItem(region) {
            return `<p class="selects-wrap__option small-text">${region}</p>`;
        }
    }
}

class TextInputCheckboxes extends Input {
    constructor(node) {
        super(node);
        this.apply = this.apply.bind(this);
        this.removeTag = this.removeTag.bind(this);

        this.input = this.rootElem.querySelector(".selects-input-checkbox__input");
        this.ariaLabel = this.input.getAttribute("aria-label") || "";
        this.applyButton = this.rootElem.querySelector(".selects-wrap-checkbox__button");
        this.checkboxesBlock = this.rootElem.querySelector(".selects-wrap-checkbox");
        this.checked = [];
        this.inputWrapper = this.rootElem.querySelector(".selects-input-checkbox__wrapper");
        if (!this.inputWrapper) this.inputWrapper = this.rootElem;

        if (this.rootElem.hasAttribute("data-select-controls")) this.createControls();
        this.getCheckboxes();
        this.checkboxes.forEach(cb => cb.value = cb.value.replace(/\s\s/g, ""));
        this.closeSelects();
        this.initInput();
        if (this.applyButton) this.applyButton.addEventListener("click", this.apply);
    }
    checkCompletion() {

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

        this.selectValues = this.selectValues.map(checkbox => {
            return {
                node: checkbox.closest("label"),
                text: checkbox.value.replace(/\s\s/g, ""),
                textNode: checkbox.closest("label").querySelector(".text")
            }
        });
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
}

class TextInputCheckboxesRegion extends TextInputCheckboxes {
    constructor(node) {
        super(node);

        this.createControls();
        this.setRegions();
    }
    setRegions() {
        fetch("/vsevn-ad/json/regions.json")
            .then(data => data.json())
            .then(regions => {
                let innerhtml = "";
                if (!this.selectsWrap)
                    this.selectsWrap = this.rootElem.querySelector(".selects-wrap-checkbox");
                regions.forEach(region => innerhtml += createItem(region));

                this.selectsWrap.innerHTML = "";
                this.selectsWrap.insertAdjacentHTML("afterbegin", innerhtml);
                this.getSelectsWrap();
                this.getCheckboxes();
            });

        function createItem(region) {
            return `
            <label class="flex checkboxs__items_item">
                <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="${region}">
                <span class="checkmark">
                <img src="img/checkmark.png" alt="checkmark">
                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                </span>
                <span class="text small-text">${region}</span>
            </label>
            `;
        }
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

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-required");
        this.inputWrappers = Array.from(this.rootElem.querySelectorAll(".radios-item__radios"));
        this.requiredInputWrappers = this.inputWrappers
            .filter(inpWrapp => !inpWrapp.hasAttribute("data-optional"));
        this.inputWrappers.forEach(inpWrapp => inpWrapp.addEventListener("change", this.onChange));
    }
    checkCompletion() {
        this.checkInputsCompletion();
        const uncheckedRequired = this.getUncheckedRequired();
        this.isCompleted = uncheckedRequired.length < 1;

        return this.isCompleted;
    }
    checkInputsCompletion() {
        const uncheckedRequired = this.getUncheckedRequired();
        const checkedOrNotRequired = this.inputWrappers
            .filter(inpWrapp => !uncheckedRequired.includes(inpWrapp));

        uncheckedRequired.forEach(inpWrapp => inpWrapp.classList.add("__uncompleted"));
        checkedOrNotRequired.forEach(inpWrapp => inpWrapp.classList.remove("__uncompleted"));

        if (uncheckedRequired.length < 1) this.rootElem.classList.remove("__uncompleted");
    }
    getUncheckedRequired() {
        return this.requiredInputWrappers
            .filter(inpWrapp => !inpWrapp.querySelector("input:checked"));
    }
    onChange() {
        if (this.rootElem.classList.contains("__uncompleted")) this.checkInputsCompletion();
    }
}

class AddFieldButton {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;

        this.counter = 2;
        this.addedFields = [];

        this.getData();
        this.rootElem.addEventListener("click", this.onClick);
    }
    getData() {
        const addData = this.rootElem.dataset.addField.split("; ");
        this.insertToBlock = findClosest(this.rootElem, addData[2]);
        const maxFieldsRepeat = parseInt(addData[1]);
        this.maxFieldsRepeat = maxFieldsRepeat > 0 ? maxFieldsRepeat : 1;

        const selectors = addData[0];
        if (selectors.startsWith("{") && selectors.endsWith("}")) {
            const string = selectors.replace("{", "").replace("}", "");
            this.selectors = string.split(", ");
            this.cloneRefList = this.selectors.map(selector => findClosest(this.rootElem, selector));
        } else {
            this.selectors = selectors;
            this.cloneRef = findClosest(this.rootElem, this.selectors);
        }

        this.rootElem.removeAttribute("data-add-field");
    }
    onClick() {
        this.addField();
    }
    addField() {
        if (this.addedFields.length > this.maxFieldsRepeat) return;
        initField = initField.bind(this);

        // вставка одного поля
        if (this.cloneRef) {
            const field = this.cloneRef.cloneNode(true);
            initField(field);
            this.addedFields.push(field);
            const removeButton = this.createRemoveButton();
            field.append(removeButton);
            removeButton.addEventListener("click", () => this.removeField(field));

            const addButton = field.querySelector(".add");
            if (addButton) addButton.remove();
        }
        // вставка нескольких полей
        else if (this.cloneRefList) {
            const fields = this.cloneRefList.map(cloneRef => cloneRef.cloneNode(true));
            fields.forEach(field => initField(field));
            this.addedFields.push(fields);
            const removeButton = this.createRemoveButton();
            removeButton.addEventListener("click", () => {
                this.removeField(fields[0]);
                removeButton.remove();
            });
            fields[0].parentNode.append(removeButton);

            fields.forEach(fd => {
                const addButton = fd.querySelector(".add");
                if (addButton) addButton.remove();
            });
        }

        if (this.addedFields.length >= this.maxFieldsRepeat) this.rootElem.classList.add("none");

        function initField(field) {
            this.replaceUniqueAttributes(field);
            this.replaceValue(field);

            if (this.insertToBlock) this.insertToBlock.after(field);
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
                newValue = originValue.trim().replace(/\d\b/, "").replace(/\-\b/, "")
                    + "-" + this.counter.toString();
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
        this.regionSearch = this.rootElem.querySelector(".map-block__region");
        this.streetSearch = this.rootElem.querySelector(".map-block__street");
        this.houseSearch = this.rootElem.querySelector(".map-block__house");

        if (this.regionSearch) this.regionSearch.addEventListener("change", this.getAddr);
        if (this.streetSearch) this.streetSearch.addEventListener("change", this.getAddr);
        if (this.houseSearch) this.houseSearch.addEventListener("change", this.getAddr);
    }
    getAddr() {
        let region = this.regionSearch ? this.regionSearch.value : "";
        let street = this.streetSearch && this.streetSearch.value
            ? "ул. " + this.streetSearch.value
            : "";
        let house = this.houseSearch && this.houseSearch.value
            ? "дом " + this.houseSearch.value
            : "";
        if (!region) return;
        if (region && (street || house)) region += ", ";
        if (street && house) street += ", ";

        let addrValue = region + street + house;
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
        this.popupParams = {};
        this.popupData[1].split("; ").forEach(property => {
            const propSplit = property.split(":");
            const key = propSplit[0];
            const value = propSplit[1];
            this.popupParams[key] = value;
        });
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
        const otherInputs = document.querySelectorAll(`input[name="${name}"]`);
        otherInputs.forEach(inp => {
            inp.addEventListener("change", () => {
                if (this.rootElem.checked) this.initPopup();
            });
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
                    <div class="selects-input-checkbox selects-input-checkbox--region" data-unset-max-height data-tags-select="${selectName}">
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
                            const isCheckboxSelect = inpParams instanceof TextInputCheckboxes;
                            const isPopupChild = inpParams.rootElem.closest(".popup") === popupNode;
                            return isCheckboxSelect && isPopupChild;
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
                    <div class="text-input text-input--regions text-input-area" data-tags-select="${selectName}">
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
    initPopup(isInvisible = false) {
        if (!this.popup) this.createPopup();
        this.popup.init(isInvisible);
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

        const inputs = findInittedInputByFlag("inputParams", true);
        const uncompleted = inputs.filter(inpParams => {
            const isRequired = inpParams.isRequired;
            if (!isRequired) return false;

            const isCompleted = inpParams.checkCompletion();
            return isCompleted ? false : true;
        });
        if (uncompleted.length > 0) {
            uncompleted.forEach(inpParams => inpParams.rootElem.classList.add("__uncompleted"));
        }
    }
}

let inputsInittingSelectors = [
    { selector: ".text-input--standard", classInstance: TextInput, flag: "inputParams" },
    { selector: ".text-input--regions", classInstance: TextInputRegions, flag: "inputParams" },
    { selector: ".text-input--phone", classInstance: TextInputPhone, flag: "inputParams" },
    { selector: ".time-schedule__select", classInstance: TimeScheduleInput, flag: "inputParams" },
    { selector: ".time-schedule__item", classInstance: TimeScheduleItem, flag: "inputParams" },
    { selector: ".textarea-wrapper", classInstance: Textarea, flag: "inputParams" },
    { selector: "[data-add-field]", classInstance: AddFieldButton, flag: "inputParams" },
    { selector: "[data-addfield-input]", classInstance: AddFieldByInput, flag: "inputParams" },
    { selector: ".map-block", classInstance: MapBlock, flag: "inputParams" },
    { selector: "[data-create-popup]", classInstance: CreatePopup, flag: "inputParams" },
    {
        selector: ".selects-input-checkbox--standard",
        classInstance: TextInputCheckboxes,
        flag: "inputParams"
    },
    {
        selector: ".selects-input-checkbox--region",
        classInstance: TextInputCheckboxesRegion,
        flag: "inputParams"
    },
    { selector: ".radio-wrap", classInstance: RadioWrapper, flag: "inputParams" },
    { selector: ".page-input-buttons", classInstance: PageInputButtons, flag: "inputParams" },
    { selector: ".add-photo", classInstance: AddPhoto, flag: "inputParams" },
    { selector: "#form", classInstance: Form },
];
inittingSelectors = inittingSelectors.concat(inputsInittingSelectors);