// js speedtest array vs. linked list

LinkedList = function() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

ListElement = function(list, data, prev, next) {
  this.list = list;
  this.d = data;
  this.next = next;
  this.prev = prev;
}

ListElement.prototype.append = function(data) {
  var el = new ListElement(this.list, data, this, this.next);
  this.list.length++;
  if (!this.next) this.list.tail = el;
  this.next = el;
  return el;
}

ListElement.prototype.prepend = function(data) {
  var el = new ListElement(this.list, data, this.prev, this);
  this.list.length++;
  if (!this.prev) this.list.head = el;
  this.prev = el;
  return el;
}

ListElement.prototype.remove = function() {
  if (this.prev) this.prev.next = this.next;
  else this.list.head = this.next;
  if (this.next) this.next.prev = this.prev;
  else this.list.tail = this.prev;
  this.list.length--;
  return this;
}

ListElement.prototype.forTail = function(fn) {
  for (var el = this.next; el; el=el.next) { fn(el.d, el) }
}

LinkedList.prototype.push = function(data) {
  if (!this.head) {
    return this.head = this.tail = new ListElement(this, data, null, null);
  }
  else return this.tail.append(data);
}

LinkedList.prototype.forEach = function(fn) {
  for (var el = this.head; el; el=el.next) { fn(el.d, el) }
}

LinkedList.prototype.toArray = function() {
  var a = [];
  for (var el = this.head; el; el=el.next) a.push(el.d);
  return a;
}

// Array Remove - adopted from John Resig
array_remove = function(a, from, to) {
  var rest = a.slice((to || from) + 1 || a.length);
  a.length = from < 0 ? a.length + from : from;
  return a.concat(rest);
};

speed_test = function() {
  console.log('==Testing Linked List==');
  var l = new LinkedList();
  var time = Date.now();
  for (var i=0; i<1000000; ++i) l.push(i);
  console.log('pushing 1,000,000 elements: ' + (Date.now()-time));
  
  var time = Date.now();
  for (var el = l.head; el; el=el.next) { if (el.d == -1) return; }
  console.log('iterating 1,000,000 elements: ' + (Date.now()-time));

  var time = Date.now();
  for (var el = l.head; el; el=el.next) { el.remove(); }
  console.log('removing 1,000,000 elements: ' + (Date.now()-time));  


  console.log('==Testing Array==');
  var a = new Array();
  var time = Date.now();
  for (var i=0; i<1000000; ++i) a.push(i);
  console.log('pushing 1,000,000 elements: ' + (Date.now()-time));
  
  var time = Date.now();
  for (var i=0; i<1000000; ++i) { if (a[i] == -1) return; }
  console.log('iterating 1,000,000 elements: ' + (Date.now()-time));

  var time = Date.now();
  for (var i=0; i<100; ++i) { a = array_remove(a,i); }
  console.log('removing 100 elements: ' + (Date.now()-time));  
}
