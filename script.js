"use strict";

const notDoneToDoArea = document.querySelector("#not-done-todo")
const doneToDoArea = document.querySelector("#done-todo")
const addButton = document.querySelector("#add-todo-button")
const textInput = document.querySelector("#todo-text-input")
const alertArea = document.querySelector("#too-long-text-alert")
const prologSession = pl.create()

class PrologRules {
    constructor() {
        this.emptyTextRule = `
            emptytext('a0').
        `
        this.tooLongTextRule = `
            toolongtext(X) :- X > 10.
        `
        this.existingTodo = []
    }

    getExistingTodoPrologString = () => {
        if (this.existingTodo.length == 0) {
            console.error("empty todo list")
            return
        }

        let todoPrologString = `\n`

        for (let i = 0; i < this.existingTodo.length; i++)  {
            todoPrologString += `existTodoString('${this.existingTodo[i]}').\n`
        }

        return todoPrologString
    }

    addTodoString = (str) => {
        this.existingTodo.push(str)
    }
}


const prologRules = new PrologRules()

class ToDo {
    constructor(text) {
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
        delete this
    }
}


const removeAlerts = () => {
    textInput.value = ""
    alertArea.classList.remove("visible")
}

//generalnie działa ale strasznie dziwny problem był z asynchronicznością
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
    // magiczna konstrukcja z uzyciem " ` ` " znaku bo jako zwykly string nie dziala
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

    removeAlerts()
    const todo = new ToDo(todoString)
    prologRules.addTodoString(todoString)
    console.log(prologRules.existingTodo)
}

addButton.addEventListener("click", addTodoObject)
document.addEventListener("keypress", e => {
    if (e.key == "Enter") {
        addTodoObject()
    }
})