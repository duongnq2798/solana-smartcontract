### Tested functionalities
```
❯ anchor test                                                                                              
todos
	create lists
		✔ can create a list
		✔ can create another list for a user with an active list
	add items
		✔ can add items from different users
		✔ cannot add items when the list is full
		✔ cannot use a bounty smaller than the rent-exempt amount
	cancel items
		✔ can cancel item: list owner
		✔ can cancel item: item creator
		✔ cannot cancel item: other user
		✔ cannot cancel item: item creator with wrong key
		✔ cannot cancel item in other list
	finish
		✔ can finish items: first owner then item creator
		✔ can finish items: first item creator then list owner
		✔ cannot finish items: other user
		✔ cannot finish item in other list
		✔ cannot finish item with wrong list owner
		✔ cannot finish an already-finished item
```

