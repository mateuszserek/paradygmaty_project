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

        todoDiv.append(pElem)
        todoDiv.append(doneB)
        todoDiv.append(deleteB)

        notDoneToDoArea.append(todoDiv)
    }

    eventListeners = () => {
        this.deleteButton.addEventListener("click", () => {
            this.killElement()
        })

        this.doneButton.addEventListener("click", () => {
            doneToDoArea.appendChild(this.todoDiv)
        })
    }

    killElement = () => {
        this.todoDiv.remove()
        delete this
    }
}


addButton.addEventListener("click", () => {
    let todoString = textInput.value
    textInput.value = ""
    // function in prolog to check todo string
    const todo = new ToDo(todoString)
})
