/* ========================================= ОБЩИЕ СКРИПТЫ ========================================= */
const inittedInputs = [];

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

class Popup {
    constructor(data = {}) {
        // data = { popupInner = "htmlString", popupClassName: "string", transitionDuration: number }. Если указан data.transitionDuration и data-transition-duration, приоритет имеет атрибут.
        this.onPopupClick = this.onPopupClick.bind(this);
        let popupInner = data.popupInner;
        if (!popupInner) popupInner = `
            <div class="popup__body">
                <svg class="popup__cross">
                    <use xlink:href="#cross-icon"></use>
                </svg>
            </div>`;
        this.rootElem = createElement("div", "popup", popupInner);
        this.popupBody = this.rootElem.querySelector(".popup__body");
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
    init() {
        document.querySelector(".wrapper").append(this.rootElem);
        setTimeout(() => this.setStyles("show"), 50);
    }
    remove() {
        this.setStyles("remove");
        setTimeout(() => {
            this.rootElem.remove();
        }, this.transitionDuration);
    }
}

class SelectTagsPopup extends Popup {
    constructor(argData = {}) {
        let popupInner = `
        <div class="popup__body">
            <svg class="popup__cross">
                <use xlink:href="#cross-icon"></use>
            </svg>
            <label for="live-area_popup" class="popup__title text big-text">
                Регион/населенный пункт:
            </label>
            <div class="selects-input-checkbox">
                <div class="selects-input-checkbox__wrapper">
                    <input class="selects-input-checkbox__input" required id="live-area_popup" type="text">
                    <span class="arrow"></span>
                    <span class="cross">
                        <svg>
                            <use xlink:href="#cross-icon"></use>
                        </svg>
                    </span>
                    <div class="prompt-hover__open">Очистить поле?</div>
                    <div class="selects-wrap-checkbox">
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Алтайский край">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Алтайский край</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Амурская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Амурская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Архангельская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Архангельская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Астраханская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Астраханская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Белгородская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Белгородская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Брянская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Брянская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Владимирская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Владимирская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Волгоградская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Волгоградская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Вологодская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Вологодская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Воронежская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Воронежская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Москва">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Москва</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Еврейская автономная область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Еврейская автономная область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Забайкальский край">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Забайкальский край</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Ивановская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Ивановская область</span>
                        </label>
                        <p class="selects-wrap__option small-text">Иные территории, включая город и
                            космодром Байконур</p>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Иркутская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Иркутская область</span>
                        </label>

                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Кабардино-Балкарская Республика">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Кабардино-Балкарская Республика</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Калининградская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Калининградская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Калужская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Калужская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Камчатский край">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Камчатский край</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Карачаево-Черкесская Республика">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Карачаево-Черкесская Республика</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Кемеровская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Кемеровская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Кировская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Кировская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Костромская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Костромская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Краснодарский край">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Краснодарский край</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Красноярский край">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Красноярский край</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Курганская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Курганская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Курская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Курская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Ленинградская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Ленинградская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Липецкая область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Липецкая область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Магаданская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Магаданская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Московская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Московская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Мурманская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Мурманская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Ненецкий автономный округ">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Ненецкий автономный округ</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Нижегородская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Нижегородская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Новгородская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Новгородская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Новосибирская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Новосибирская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Омская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Омская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Оренбургская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Оренбургская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Орловская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Орловская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Пензенская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Пензенская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Пермский край">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Пермский край</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Приморский край">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Приморский край</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Псковская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Псковская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Адыгея (Адыгея)">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Адыгея (Адыгея)</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Алтай">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Алтай</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Башкортостан">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Башкортостан</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Бурятия">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Бурятия</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Дагестан">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Дагестан</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Ингушетия">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Ингушетия</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Калмыкия">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Калмыкия</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Карелия">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Карелия</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Коми">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Коми</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Крым">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Крым</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Марий Эл">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Марий Эл</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Мордовия">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Мордовия</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Саха (Якутия)">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Саха (Якутия)</span>
                        </label>
                        <p class="selects-wrap__option small-text">Республика Северная Осетия - Алания
                        </p>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Татарстан (Татарстан)">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Татарстан (Татарстан)</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Тыва">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Тыва</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Республика Хакасия">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Республика Хакасия</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Ростовская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Ростовская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Рязанская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Рязанская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Самарская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Самарская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Санкт-Петербург">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Санкт-Петербург</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Саратовская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Саратовская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Сахалинская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Сахалинская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Свердловская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Свердловская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Севастополь">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Севастополь</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Смоленская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Смоленская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Ставропольский край">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Ставропольский край</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Тамбовская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Тамбовская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Тверская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Тверская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Томская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Томская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Тульская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Тульская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Тюменская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Тюменская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Удмуртская Республика">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Удмуртская Республика</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Ульяновская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Ульяновская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Хабаровский край">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Хабаровский край</span>
                        </label>
                        <p class="selects-wrap__option small-text">Ханты-Мансийский автономный округ -
                            Югра
                        </p>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Челябинская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Челябинская область</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Чеченская Республика">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Чеченская Республика</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Чувашская Республика - Чувашия">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Чувашская Республика - Чувашия</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Чукотский автономный округ">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Чукотский автономный округ</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Ямало-Ненецкий автономный округ">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Ямало-Ненецкий автономный округ</span>
                        </label>
                        <label class="flex checkboxs__items_item">
                            <input class="mr-5 checkbox selects-checkbox" type="checkbox" value="Ярославская область">
                            <span class="checkmark">
                                <img src="img/checkmark.png" alt="checkmark">
                                <img class="checkmark-hover-img" src="img/check_mark_hover.png" alt="checkmark-hover">
                            </span>
                            <span class="text small-text">Ярославская область</span>
                        </label>
                        <button class="selects-wrap-checkbox__button" type="button">Применить</button>
                    </div>
                </div>
                <div class="error work-error">
                    Это поле обязательно
                </div>
            </div>
        </div>
        `;
        let data = { popupInner }
        super(data);
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
        this.clearButton = this.rootElem.querySelector(".cross");
        this.wrongValueMessageBlock = this.rootElem.querySelector(".text-input__wrong-value");
        this.selectsTransitionDur = 300;

        this.getSelectsWrap();
        document.addEventListener("click", this.onDocumentClick);
        if (this.clearButton) this.clearButton.addEventListener("click", this.clear);
    }
    initInput() {
        this.input.addEventListener("input", this.onInput);
        this.input.addEventListener("focus", this.onFocus);
        this.input.addEventListener("change", this.onChange);
        this.input.addEventListener("blur", this.onChange);
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
        this.selectsWrap.style.removeProperty("max-height");
        this.selectsWrap.style.removeProperty("visibility");
        this.selectsWrap.style.cssText = "padding: 0; margin: 0;";
    }
    openSelects() {
        if (!this.selectsWrap) return;

        this.rootElem.classList.add("open-selects");
        const maxHeight = this.getSelectsHeight();
        setTimeout(() => {
            this.selectsWrap.style.cssText = `max-height: ${maxHeight}px; visibility: visible;`;
            setTimeout(() => {
                this.selectsWrap.style.removeProperty("transition");
            }, this.selectsTransitionDur);
        }, 0);
    }
    highlitMatches(fullMatch = null) {
        const value = this.input.value.toLowerCase().trim();
        const noMatch = !Boolean(this.selectValues.find(selVal => selVal.text.includes(this.input.value)));
        noMatch && !value.includes("выбрано")
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
                } else selVal.node.classList.add("none");
            });
        }
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
        this.inputWrapper = this.rootElem.querySelector(".text-input__wrapper");
        if (!this.inputWrapper) this.inputWrapper = this.rootElem;

        this.closeSelects();
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
            return { node: selVal, text: selVal.textContent || val.innerText };
        });
        this.selectValues.forEach(selVal => {
            selVal.node.addEventListener("click", () => {
                this.input.value = selVal.text;
                this.input.dispatchEvent(new Event("input"));
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
        this.ariaLabel = this.input.getAttribute("aria-label") || "";
        this.applyButton = this.rootElem.querySelector(".selects-wrap-checkbox__button");
        this.checkboxesBlock = this.rootElem.querySelector(".selects-wrap-checkbox");
        this.checkboxes = Array.from(this.checkboxesBlock.querySelectorAll(".selects-checkbox"));
        this.checked = [];
        this.inputWrapper = this.rootElem.querySelector(".selects-input-checkbox__wrapper");
        if (!this.inputWrapper) this.inputWrapper = this.rootElem;

        this.closeSelects();
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
            this.input.value = this.ariaLabel + " (выбрано: " + this.checked.length + ")";
        }
        this.input.dispatchEvent(new Event("change"));
        this.input.dispatchEvent(new Event("input"));

        this.closeSelects();
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
                text: checkbox.value,
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
        this.checkboxes.forEach(cb => cb.checked = false);
        this.apply();
    }
    highlitMatches() {
        const fullMatch = this.input.value.includes("выбрано");
        super.highlitMatches(fullMatch);
    }
    setHighlightedText(substr, selVal) {
        selVal.textNode.innerHTML = substr;
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

class AddFieldByInput {
    constructor(node) {
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        const key = this.rootElem.dataset.addfieldInput;
        const name = this.rootElem.getAttribute("name");
        const creatingElems = Array.from(
            document.querySelectorAll(`[data-addfield-input-target="${key}"]`)
        );

        this.creatingElems = creatingElems.map(elem => {
            return { elem, anchor: createElement("div", "none") };
        });
        this.otherInputs = document.querySelectorAll(`input[name="${name}"]`);

        this.onChange();
        this.otherInputs.forEach(inp => inp.addEventListener("change", this.onChange));
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

class CreatePopup {
    constructor(node) {
        this.createPopup = this.createPopup.bind(this);

        this.rootElem = node;
        this.popupName = this.rootElem.dataset.createPopup;
        this.rootElem.removeAttribute("data-create-popup");

        const type = this.rootElem.getAttribute("type");
        switch (type) {
            case "checkbox":
            case "radio":
                this.initInputButton();
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
        this.rootElem.addEventListener("click", this.initPopup);
    }
    createPopup() {
        switch (this.popupName) {
            case "Popup": this.popup = new Popup();
            default:
                break;
            case "SelectTagsPopup": this.popup = new SelectTagsPopup();
                break;
        }
    }
    initPopup() {
        if (!this.popup) this.createPopup();
        this.popup.init();
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
    { selector: ".text-input--phone", classInstance: TextInputPhone, flag: "inputParams" },
    { selector: "[data-add-field]", classInstance: AddFieldButton, flag: "inputParams" },
    { selector: "[data-addfield-input]", classInstance: AddFieldByInput, flag: "inputParams" },
    { selector: "[data-create-popup]", classInstance: CreatePopup, flag: "inputParams" },
    { selector: ".selects-input-checkbox", classInstance: TextInputCheckboxes, flag: "inputParams" },
    { selector: ".radio-wrap", classInstance: RadioWrapper, flag: "inputParams" },
    { selector: ".page-input-buttons", classInstance: PageInputButtons, flag: "inputParams" },
    { selector: ".add-photo", classInstance: AddPhoto, flag: "inputParams" },
    { selector: "#form", classInstance: Form },
];
inittingSelectors = inittingSelectors.concat(inputsInittingSelectors);