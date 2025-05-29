"use strict";

const notDoneToDoArea = document.querySelector("#not-done-todo")
const doneToDoArea = document.querySelector("#done-todo")
const addButton = document.querySelector("#add-todo-button")
const textInput = document.querySelector("#todo-text-input")
const alertArea = document.querySelector("#too-long-text-alert")
const popup = document.querySelector("#popup")
const popupAddButton = document.querySelector("#popup-add-button")
const popupCancelButton = document.querySelector("#popup-delete-button")
const prologSession = pl.create()

let counterForID = 0 
let isAlertOn = false

class PrologRules {
    constructor() {
        this.emptyTextRule = `
            emptytext('a0').
        `
        this.tooLongTextRule = `
            toolongtext(X) :- X > 40.
        `
        this.existingTodo = [] //contains: [id, full string, **keywords array]
    }

    getExistingTodoPrologString = () => {
        if (this.existingTodo.length == 0) {
            return -1
        }

        let todoPrologString = `\n`

        this.existingTodo.forEach(element => {
            todoPrologString += `existTodoString('${element[1]}').\n`
        })
        return todoPrologString
    }

    getExistingKeywordPrologString = () => {
        if (this.existingTodo.length == 0) {
            return -1
        }

        let todoPrologString = `\n`

        this.existingTodo.forEach(element => {
            element[2].forEach(key => {
                todoPrologString += `existKeyword('${key}').\n`
            })
        })   
             
        return todoPrologString
    }

    addTodoString = (str, todoID) => {
        const keywords = []
        str.split(" ").forEach(elem => {
            if(elem.length > 4) {
                keywords.push(elem)
            }
        })
        
        this.existingTodo.push([todoID, str, keywords])
    }

    removeTodoString = (todoID) => {
        this.existingTodo.forEach(element => {
            if(element[0] == todoID) {
                const index = this.existingTodo.indexOf(element)
                this.existingTodo.splice(index, 1)
            }
        })
    }
}

const prologRules = new PrologRules()

class ToDo {
    constructor(text) {
        this.id = counterForID
        counterForID ++

        this.text = text
        this.doneButton = document.createElement("button")
        this.deleteButton = document.createElement("button")
        this.todoDiv = document.createElement("div")
        this.pElem = document.createElement("p")

        this.generateElements(this.doneButton, this.deleteButton, this.todoDiv, this.pElem)
        this.eventListeners()
    }

    generateElements = (doneB, deleteB, todoDiv, pElem) => {
        todoDiv.classList.add("todo") 

        pElem.textContent = this.text
        doneB.type = "submit"
        doneB.textContent = "Ukończono"
        deleteB.type = "submit"
        deleteB.textContent = "Usuń"

        let buttonDiv = document.createElement("div")
        buttonDiv.append(doneB)
        buttonDiv.append(deleteB)

        todoDiv.append(pElem)
        todoDiv.append(buttonDiv)

        notDoneToDoArea.append(todoDiv)
        textInput.setAttribute("placeholder", "Wpisz treść swojego todosa")
    }

    doneButtonDelete = () => {
        this.doneButton.style.display = "None"
    }

    eventListeners = () => {
        this.deleteButton.addEventListener("click", this.killElement)

        this.doneButton.addEventListener("click", () => {
            doneToDoArea.appendChild(this.todoDiv)
            this.doneButtonDelete()
        })
    }

    killElement = () => {
        this.todoDiv.remove()
        prologRules.removeTodoString(this.id)
        delete this
    }
}


const removeAlerts = () => {
    textInput.value = ""
    document.body.style.overflow = "auto"
    alertArea.classList.remove("visible")
    popup.classList.remove("visible")
    isAlertOn = false
}

const loadPrologQuery = (query, toBeConsulted) => {
        return new Promise((resolve, reject) => {
            prologSession.consult(toBeConsulted)
            prologSession.query(query)
            prologSession.answer(x => { 
                const val = prologSession.format_answer(x)
                if (val === "true") {
                    resolve(true)
                } else {
                    resolve(false)
                }
            })
        })
}


async function emptyText(str) {
    const query = `emptytext('a${str.length}').`
    const toBeConsulted = prologRules.emptyTextRule
    const prologResponse = await loadPrologQuery(query, toBeConsulted).then(res => {
        return res
    })

    return prologResponse //bool
}

async function tooLongText(str) {
    const query = `toolongtext(${str.length}).`
    const toBeConsulted = prologRules.tooLongTextRule
    const prologResponse = await loadPrologQuery(query, toBeConsulted).then(res => {
        return res
    })

    return prologResponse //bool
}

async function checkIfNotAlreadyExist(str) {
    const toBeConsulted = prologRules.getExistingTodoPrologString()
    if (toBeConsulted == -1) {
        return false
    }
    const query = `existTodoString('${str}').`
    const prologResponse = await loadPrologQuery(query, toBeConsulted).then(res => {
        return res 
    })
    return prologResponse //bool
}

async function checkIfContainKeywords(str) {
    const toBeConsulted = prologRules.getExistingKeywordPrologString()

    if(toBeConsulted == -1) {
        return false
    }

    const keywords = str.split(" ")
    for(let i = 0; i < keywords.length; i++) {
        const query = `existKeyword('${keywords[i]}').`
        const prologResponse = await loadPrologQuery(query, toBeConsulted)

        if(prologResponse == true) {
            return true
        }
    }
    return false
}

const addAfterValidation = (todoString) => {
    removeAlerts()
    const todo = new ToDo(todoString)
    prologRules.addTodoString(todoString, todo.id)
}

async function addTodoObject() {
    const todoString = textInput.value
    const empty = await emptyText(todoString)

    if(empty) {
        textInput.setAttribute("placeholder", "pusty napis")
        return
    }

    const tooLong = await tooLongText(todoString)

    if (tooLong) {
        alertArea.classList.add("visible")
        return
    } 

    const alreadyExist = await checkIfNotAlreadyExist(todoString)

    if(alreadyExist) {
        alert("w tym miejscu pojawi się coś gdy tekst już istnieje ;)")
        return
    }

    const hasKeywords = await checkIfContainKeywords(todoString)

    if(hasKeywords) {
        popup.classList.add("visible")
        document.body.style.overflow = "hidden"
        isAlertOn = true
        return
    }

    addAfterValidation(todoString)
}

addButton.addEventListener("click", addTodoObject)

popupAddButton.addEventListener("click", () => {
    const todoString = textInput.value
    addAfterValidation(todoString)
    removeAlerts()
})

popupCancelButton.addEventListener("click", removeAlerts)

document.addEventListener("keypress", e => {
    if (e.key == "Enter" && !isAlertOn) {
        addTodoObject()
    }
})