function array_intersection(a, b)
{
  var ai=0, bi=0;
  var result = new Array();

  while( ai < a.length && bi < b.length )
  {
     if      (a[ai] < b[bi] ){ ai++; }
     else if (a[ai] > b[bi] ){ bi++; }
     else /* they're equal */
     {
       result.push(a[ai]);
       ai++;
       bi++;
     }
  }

  return result;
}
var flatten = function(toFlatten) {
  var isArray = Object.prototype.toString.call(toFlatten) === '[object Array]';

  if (isArray && toFlatten.length > 0) {
    var head = toFlatten[0];
    var tail = toFlatten.slice(1);

    return flatten(head).concat(flatten(tail));
  } else {
    return [].concat(toFlatten);
  }
};
Array.prototype.clone = function(){
  return Array.apply(null,this)
};
Array.prototype.sortIt    = Array.prototype.sort;
Array.prototype.reverseIt = Array.prototype.reverse;
Array.prototype.sort = function(){
  var tmp = this.clone();
  return tmp.sortIt.apply(tmp,arguments)
}
Array.prototype.reverse = function(){
  var tmp = this.clone();
  return tmp.reverseIt.apply(tmp,arguments)
}
