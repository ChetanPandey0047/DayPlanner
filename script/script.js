let dataController = (function() {

    let quotes = function(quote, author) {
        this.quote = quote;
        this.author = author;
    };

    let quoteList = new Array();
    
    quoteList[0] = new quotes('It\'s not enough to be busy, so are the ants. The question is, what are we busy about?', '-- Henry David Thoreau');
    quoteList[1] = new quotes('The key is in not spending time, but in investing it.', '-- Stephen R. Covey');
    quoteList[2] = new quotes('Let our advance worrying become advance thinking and planning.', '-- Winston Churchill');
    quoteList[3] = new quotes('Time is more valuable than money. You can get more money, but you cannot get more time.', '-- Jim Rohn');
    quoteList[4] = new quotes('The shorter way to do many things is to only do one thing at a time.', '-- Mozart');
    quoteList[5] = new quotes('Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin.', '-- Mother Teresa');
    quoteList[6] = new quotes('Take care of the minutes and the hours will take care of themselves.', '-- Lord Chesterfield');

    let taskList = new Array();
    let data = function() {
        this.desc = '';
        this.id = -1;
        this.checked = false;
    };
    let taskItem;

    if(localStorage.getItem('taskList') !== null)
    {
        taskList = JSON.parse(localStorage.getItem('taskList'));
    }

    let findItem = function(ID)
    {
        for(let i = 0; i < taskList.length; ++i)
        {
            if(taskList[i].id === Number(ID))
            {
                itemIndex = i;
                break;
            }
        }
        return itemIndex;
    }
    return {
        storeItem(inputVal) {
            taskItem = new data();

            if(taskList.length !== 0)
            {
                taskItem.id = taskList[taskList.length - 1].id + 1;
            }
            else {
                taskItem.id = 0;
            }
            taskItem.desc = inputVal;
            taskList.push(taskItem);
            localStorage.setItem('taskList', JSON.stringify(taskList));
            return taskList[taskList.length - 1];
        },

        removeItem(ID) {
            let itemIndex = findItem(ID);
            taskList.splice(itemIndex, 1);
            if(taskList.length === 0) 
            {
                localStorage.removeItem('taskList');
            }
            else {
                localStorage.setItem('taskList', JSON.stringify(taskList));
            }
        },

        getQuote(quoteIndex) {
            return quoteList[quoteIndex];
        },

        checkbox(isChecked, id) {
            let itemIndex = findItem(id);
            taskList[itemIndex].checked = !taskList[itemIndex].checked;
            localStorage.setItem('taskList', JSON.stringify(taskList));
            return taskList[itemIndex].checked;
        }
    }
})();

let UIController = (function() {
    let DOMEle = {
        sectionTasks: '.section-tasks',
        main: '.main',
        resetBtn: '.btn--reset',
        deleteBtn: '.task__delete-btn',
        container: '.task',
        quote: '.header__quote-quote',
        author: '.header__quote-author',
        checkbox: '.checkbox__label'
    }

    return {

        getDOMElements() {
            return DOMEle;
        },

        noTaskScreen() {
            let screen = '<div class="no-task-screen">Nothing to do..</div>';
            let mainObj = document.querySelector(DOMEle.main);

            // REMOVING 'section-tasks' FROM DOM.
            document.querySelector(DOMEle.sectionTasks).style.display = 'none';
            
            // APPENDING 'no-task-screen' TO DOM.
            mainObj.insertAdjacentHTML('beforeend', screen);
        },

        addTaskItem(data) {
            document.querySelector(DOMEle.sectionTasks).style.display = 'block';
            let taskItem = `<div class="task__item" id="task-${data.id}"><div class="task__item--left"><div class="task__delete" id="deleteBtn"><i class="icon-arrows-circle-remove"></i></div><div class="task__desc"><h3 class="heading-tertiary">${data.desc}</h3></div></div><div class="task__item--right"><div class="checkbox"><input type="checkbox" class="checkbox__input" id="${data.id}"><label class="checkbox__label" for="${data.id}"><span class="checkbox__custom"></span></label></div></div></div>`;

            document.querySelector('.task').insertAdjacentHTML('beforeend', taskItem);
            document.getElementById('eventInput').value = '';
            document.getElementById(data.id).checked = data.checked;

            this.checkbox(data.checked, data.id);
        },

        deleteTaskItem(ItemID) {
            document.querySelector(DOMEle.container).removeChild(document.getElementById('task-'+ItemID));
        },

        showQuote(quote)
        {
            document.querySelector(DOMEle.quote).textContent = quote.quote;
            document.querySelector(DOMEle.author).textContent = quote.author;
        },

        checkbox(isChecked, id)
        {
            if(isChecked)
            {
                document.getElementById('task-'+id).classList.add('checked__darken-background');
            }
        }
    }

})();

let controller = (function(dataCtrl, UIctrl) {

    let DOMEle = UIctrl.getDOMElements();

    let quotesHandler = function() {

        let quoteIndex, quote;

        // SELECT THE RANDOM QUOTE.
        quoteIndex = Math.floor(Math.random()*7);
        quote = dataCtrl.getQuote(quoteIndex);

        // DISPLAY WITH TYPING EFFECT.
        UIctrl.showQuote(quote);

    }

    let addItem = function() {
        let inputVal, data;

        // TAKE THE INPUT VALUE
        inputVal = document.getElementById('eventInput').value;
        if(inputVal !== '')
        { 
            // STORE THE VALUE IN AN OBJECT
            data = dataCtrl.storeItem(inputVal);
            
            // UPDATE UI
            if(JSON.parse(localStorage.getItem('taskList')).length === 1)
            {
                document.querySelector(DOMEle.main).removeChild(document.querySelector('.no-task-screen'));
            }
            UIctrl.addTaskItem(data);
        }
    }

    let deleteItem = function(e) {
        let taskID;

        // SELECT ITEM FROM CONTAINER.
        if(e.target.parentNode.id === 'deleteBtn')
        {
            taskID = e.target.parentNode.parentNode.parentNode.id;
            
            // DELETE DATA STRUCTURES.
            taskID = taskID.split('-')[1];  
            dataCtrl.removeItem(taskID);
            
            // DELETE FROM UI.
            UIctrl.deleteTaskItem(taskID);
            if(localStorage.getItem('taskList') === null)
            {
                UIctrl.noTaskScreen();
            }
        }
    }

    let setupEventListeners = function() {
        let addbtn = document.getElementById('addBtn');
        let inputField = document.getElementById('eventInput');
        let reset = document.querySelector(DOMEle.resetBtn);

        // ON BUTTON CLICK.
        addbtn.addEventListener('click', addItem);

        // ON PRESSING ENTER.
        document.documentElement.addEventListener('keyup', function(e)
        {
            if(e.keyCode === 13 || e.which === 13)
            {
                addItem();
            }
        });

        // ON CLICKING CLEAR ALL.
        reset.addEventListener('click', function() {
            localStorage.removeItem('taskList');
            UIctrl.noTaskScreen();
        });

        // DELETING ONE ITEM FROM LIST.
        document.querySelector(DOMEle.container).addEventListener('click', deleteItem);

        // WEATHER ITEM IS CHECKED OR NOT.
        document.querySelector(DOMEle.container).addEventListener('change', checkbox);
    }

    let checkbox = function(e) {
        let isChecked, id;
        isChecked = e.target.checked;
        id = e.target.id;        
        
        // CHANGE DATA STRUCTURE.
        isChecked = dataCtrl.checkbox(isChecked, id);

        // UPDATE UI.
        UIctrl.checkbox(isChecked, id);

    }
    return {
        init() {
            if(localStorage.getItem('taskList') === null)
            {
                UIctrl.noTaskScreen();
            }
            else {
                for(let i = 0; i < JSON.parse(localStorage.getItem('taskList')).length; ++i)
                {
                    UIctrl.addTaskItem(JSON.parse(localStorage.getItem('taskList'))[i]);
                }
            }
            setupEventListeners();
            quotesHandler();
        }
    }
})(dataController, UIController);

controller.init();