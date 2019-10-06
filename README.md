# What is this?

This is a  Node.js app using [Express 4](http://expressjs.com/) and PostgreSQL to create an 
interactive online database of "Tokimon" and their Trainers. "Tokimons" are, of course, a parody of "Pokemon".

This was created in September-October 2019, for the class [CMPT 276](https://www.sfu.ca/students/calendar/2019/fall/courses/cmpt/276.html).


## Where is the application?

The application can be found [here](https://tranquil-journey-20855.herokuapp.com/).


## How do I add Tokimons and Trainers to the Database?

Simply use the upper menu to go to either the Trainer page or the Tokimon page. These pages have a display of what 
is in their respective Databases. Underneath the table, you will find a link to "Add new Tokimon" or "Add new Trainer".

Please be aware Trainer and Tokimon names are unique. Thus, if your new Trainer/Tokimon has a name already in use, 
it will not be added to the database.


## How do I delete Tokimons and Trainers from the Database?

To delete, simply go to the respective database page, click "Details" on the Tokimon/Trainer you wish to delete, and 
then select "Delete", which can be found at the bottom on the details page, beside "Edit". Then click "Ok" from the alert if you are sure.

Please note: A Trainer can only be deleted if all their tokimon are given to other trainers or deleted.


## How do I edit Tokimons and Trainers in the Database?

Follow the directions above, but instead of clicking "Delete", select "Edit." From there simply 
edit the information and click "UPDATE TOKIMON" or "UPDATE TRAINER".

Again, please be aware Trainer and Tokimon names are unique. Thus, if your new Trainer/Tokimon has a name already in use, 
it will not be added to the database.


## What are the extra Features of your app?

Instead of simply JUST having the following:
```sh
1. The ability to add new Tokimon (with corresponding attributes).
2. The ability to change attributes of any of the Tokimons.
3. The ability to delete any of the Tokimons.
4. The ability to display information about a specific Tokimon. A link (Links) should be provided from the Tokimon info page that links to more info.
5. The ability to display all Tokimons currently in the database (including any other information you collect
```
I have also added each of the above functions to a second table in the Tokimons Database called "Trainers".
(ie. the extra features are "Add Trainer", "Edit Trainer", "Delete Trainer", "Trainer Details Page", and a "Trainer Database" page)
Additionally, I have also created a nice Home Page that acts as a welcome and answers FAQs of users.