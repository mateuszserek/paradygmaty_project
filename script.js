"use strict";

const notDoneToDoArea = document.querySelector("#not-done-todo")
const doneToDoArea = document.querySelector("#done-todo")
const addButton = document.querySelector("#add-todo-button")
const textInput = document.querySelector("#todo-text-input")


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


const validateString = (str) => {
    if (str == "") {
        return false 
    }
    return true
}

const addTodoObject = () => {
    const todoString = textInput.value
    if (!validateString(todoString)) {
        textInput.setAttribute("placeholder", "pusty napis")
        return
    } 

    textInput.value = ""
    // function in prolog to check todo string
    const todo = new ToDo(todoString)
}

addButton.addEventListener("click", addTodoObject)
document.addEventListener("keypress", e => {
    if (e.key == "Enter") {
        addTodoObject()
    }
})