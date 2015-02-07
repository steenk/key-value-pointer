

# Module key-value-pointer

Handle JSON and JavaScript Objects.



## Method select

Internal implementation of JSON Pointer.



Constructor for the kvp object.
* **Parameter** *Object* **obj** A JavaScript object or a JSON string.
* **Return** *Object* The __kvp__ object with methods.



## Method query

The query method for traversing a JavaScript object.
The callback gets a parameter with three properties: _key_, _value_, and _pointer_.
* **Parameter** *string* **pointer** optional json pointer
* **Parameter** *function* **cb** callback



## Method select

Select anything i the object.
* **Parameter** *String* **pointer** a JSON Pointer string
* **Return**  the part of the object pointed at by the pointer



## Method replace

Replace a node in the object.
* **Parameter** *String* **pointer** a JSON Poinger string
* **Parameter**  **value** the value to insert



## Method remove

Remove a node from the object.
* **Parameter** *String* **pointer** a JSON Poinger string



## Method insert

Insert a node in the object.
* **Parameter** *String* **pointer** a JSON Poinger string
* **Parameter**  **value** the value to insert



## Method getObject

Get the object after transformations.



## Method getJSON

Get the JSON string of the object after transformations.



## Method basename

Extract the basename from a pointer.
* **Parameter** *String* **pointer** a JSON Poinger string
* **Return** *String* the basename of the pointer



## Method dirname

Extract the dirname from a pointer.
* **Parameter** *String* **pointer** a JSON Poinger string
* **Return** *String* the dirname of the pointer

