// Budget Controller
var budgetController = (function() {

    var Expense = function(id,description,value)
    {
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome>0)
            this.percentage = Math.round((this.value/totalIncome)*100);
    }
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var Income = function(id,description,value)
    {
        this.id=id;
        this.description=description;
        this.value=value;
    }

    var calculateTotal = function(type) {
        var sum=0;
        data.allItems[type].forEach(function(cur) {
            sum=sum+cur.value;
        })
        data.totals[type]=sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    return  {
        addItem: function(type,des,val) {
            var newItem,ID;
            // Create new ID
            if(data.allItems[type].length>0)
                ID=data.allItems[type][data.allItems[type].length-1].id+1;
            else
                ID=0;

            // Create new Item based on inc or exp type
            if(type==='exp')
                newItem =new Expense(ID,des,val);
            else
                newItem =new Income(ID,des,val);

            // Push it into data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },
        deleteItem: function(type,id) {
            var ids;
            var index;
            ids=data.allItems[type].map(function(current) {
                return current.id;
            })
            index=ids.indexOf(id);
            if(index!==-1)
                data.allItems[type].splice(index,1);
        },
        calculateBudget: function() {
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate budget: income-expenses
            data.budget=data.totals.inc-data.totals.exp;

            // Calculate the percentage of the income that we spent
            if(data.totals.inc>0)
                data.percentage=Math.round(( data.totals.exp / data.totals.inc ) * 100);
            else    
                data.percentage=-1;
        },
        calculatePercentages: function() {
            data.allItems['exp'].forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },
        getPercentages: function() {
            var allPer = data.allItems['exp'].map(function(cur) {
                return cur.getPercentage();
            })
            return allPer;
        },
        getBudget: function() {
            return {
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            }

        },
        testing: function() {
            console.log(data);
        }
    }

})();

// UI Controller
var uiController = (function() {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageValue: '.budget__expenses--percentage',
        container: '.container',
        expensePerLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    var formatNumber= function(num,type) {
        num=Math.abs(num);
        num=num.toFixed(2);
        numSplit= num.split('.');
        var int = numSplit[0];
        var dec= numSplit[1];
        if(int.length>3)
           int= int.substr(0,int.length-3) + ',' + int.substr(int.length-3,int.length,3); 
        return (type==='exp' ? '-' : '+') + ' ' + int + '.' + dec;


    }
    var nodeListforEach = function (list,callback) {
        for(var i=0;i<list.length;i++)
            callback(list[i],i);
    }
    return {
        getinput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensePerLabel);
            nodeListforEach(fields,function(current,index) {
                if(percentages[index]>0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---';
            })

        },
        displayMonth: function() {
            var now,year,month,months;
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changeType: function() {
            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            nodeListforEach(fields,function(cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },
        getDOMstrings: function() {
            return DOMstrings;
        },
        addListItem: function(obj,type) {
            var HTML,newHTML,element;
            // Create HTML string with placeholder text
            if(type==='inc')
            {
                element=DOMstrings.incomeContainer;
                HTML='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else
            {
                element=DOMstrings.expenseContainer;
                HTML='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>'
            }
            // Replace the placeholder text with actual data
            newHTML=HTML.replace('%id%',obj.id);
            newHTML=newHTML.replace('%description%',obj.description);
            newHTML=newHTML.replace('%value%',formatNumber(obj.value,type));
            document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);



            // Insert the HTML into DOM

        },
        deleteListItem: function(selectorID) {
            var el= document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function() {
            var val=document.querySelector(DOMstrings.inputValue);
            var des=document.querySelector(DOMstrings.inputDescription);
            val.value='';
            des.value='';
            des.focus();
        },
        displayBudget: function(obj) {
            var type;
            obj.budget>0 ? type= 'inc' : type= 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent=formatNumber(obj.totalExp,'exp');
            if(obj.percentage>0)
                document.querySelector(DOMstrings.percentageValue).textContent=obj.percentage;
            else 
                document.querySelector(DOMstrings.percentageValue).textContent='---';


        }
    }

})();

var controller= (function(uiCtrl,budgetCtrl) {

    var setupEventListeners= function() {
        var DOM=uiCtrl.getDOMstrings();
        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',uiCtrl.changeType);

        document.addEventListener('keypress',function(event) {
        if(event.keyCode===13 || event.which===13) {
            ctrlAddItem();
        }
    })
    }

    var updateBudget= function() {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget=budgetCtrl.getBudget();

        //3. Display the budget in the UI
        uiCtrl.displayBudget(budget);
    }

    var ctrlAddItem = function() {
        var newItem;
        //1. Get the filed input data
        var input=uiCtrl.getinput();

        if(input.description!=='' && !isNaN(input.value) && input.value>0)
        {
        
        //2. Add the item to the budget controller
        newItem=budgetCtrl.addItem(input.type,input.description,input.value);

        //3. Add the item to the UI
        uiCtrl.addListItem(newItem,input.type);

        //4. Clear the fields
        uiCtrl.clearFields();


        //5. Calculate and update budget
        updateBudget();

        //6. Calculate and update the percentages
        updatePercentages();


        }
    }

    var updatePercentages = function() {
        // 1. Calculate the percentages
        budgetController.calculatePercentages();

        // 2. Read percentages from the budget controller
        var per=budgetController.getPercentages();

        // 3. Display the percentage to the UI
        uiController.displayPercentages(per);
    }
    var ctrlDeleteItem = function(event) {
        var itemID= event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);
        if(itemID)
        {
            // 1. Splitting
            var splitID=itemID.split('-');
            var type=splitID[0];
            var id=parseInt(splitID[1]);
            // 2. Delete the items from the data structure
            budgetCtrl.deleteItem(type,id);

            // 3. Delete the items from the UI
            uiController.deleteListItem(itemID);

            // 4. Update and show the new budget
            updateBudget();
        }
    }

    return {
        init: function() {
            console.log("Application started");
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: '---'
            });
            setupEventListeners();
        },
    }

})(uiController,budgetController);

controller.init();