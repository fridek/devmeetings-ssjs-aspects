module("Aspect");


test("1. basic test", function(){
	equals( typeof aspect.add, "function", "aspect.remove is a function");
	
	var btest = false;
	var obj = {
		x: 10,
		btest: function(){ btest = true; },
		pow10: function(y){ return Math.pow(this.x,y); }
	};
	window.fglobal = function(){};
	var tester = 0;
	
	equals( obj.pow10(2), 100, "Test method returns 100" );
	raises( function(){aspect.add("nonexist","nonexist", function(){ tester++})}, TypeError, "Must throw type errror when executed for non-object")
	
	aspect.add( null, "fglobal", function(){ tester++} );
	window.fglobal();
	
	aspect.add( obj, "btest", function(){ tester++ } );
	aspect.add( obj, "pow10", function(){ tester++ } );
	obj.btest();
	
	equals( btest, true, "Btest function executed together with an aspect" );
	equals( obj.pow10(2), 100, "pow10 function returns 100" );
	equals( tester, 3, "Three aspect functions have been executed" );
});


test("2. after", function(){
	var obj = {
			x: 10,
			pow10: function(y){ return Math.pow(this.x,y); }
		};
	aspect.add( obj, "pow10", function(){ obj.x=11; }, "after" );
	equals( obj.pow10(2), 100, "Modified function returns 100" );
	equals( obj.x, 11, "Aspect executed once; and after the main function" );
	
});


test("once", function(){
	var obj = {
			x: 10,
			pow10: function(y){ return Math.pow(this.x,y); }
		};	
	var count = 0;
	aspect.add( obj, "pow10", function(){ count++; }, "before", true );
	obj.pow10(2);
	obj.pow10(2);
	equals( count, 1, "Aspect should be executed only once" );
});


test("3. remove", function(){
	var obj = {
			x: 10,
			pow10: function(y){ return Math.pow(this.x,y); }
		};	
	var count = 0;
	var orig = obj.pow10;
	var asp = function(){ count++; };
	equals( typeof aspect.remove, "function", "aspect.remove is a function");
	aspect.add( obj, "pow10", asp, "before" );
	obj.pow10(2);
	aspect.remove( obj, "pow10", asp, "before" );
	obj.pow10(2);
	equals( count, 1, "Aspect should be executed only once" );
	//equals( obj.pow10, orig, "obj.pow10 refers back to the original function" );
});


test("4. multiple aspects", function(){

	var obj = {
			x: 10,
			pow10: function(y){ return Math.pow(this.x,y); }
		};	
	
	var orig = obj.pow10;
	
	var c1=0, f1=function(){++c1},
		c2=0, f2=function(){++c2},
		c3=0, f3=function(){++c3};
	aspect.add( obj, "pow10", f1, "after", true );
	aspect.add( obj, "pow10", f2, "after", false );
	aspect.add( obj, "pow10", f3, "before", false );
	obj.pow10(2);
	obj.pow10(2);
	
	equals( c1, 1, "aspect f1 should execute once" );
	equals( c2, 2, "aspect f2 should execute twice" );
	equals( c3, 2, "aspect f3 should execute twice" );
	
	aspect.remove( obj, "pow10", f3, "before" );
	aspect.remove( obj, "pow10", f1, "after" ); //removes nothing

	obj.pow10(2);

	equals( c1, 1, "aspect f1 should not execute more" );
	equals( c2, 3, "aspect f2 should execute again" );
	equals( c3, 2, "aspect f3 should not execute more" );	
	
	notEqual( orig, obj.pow10, "obj.pow10 still is not an original function" );
	
	aspect.remove( obj, "pow10", f2, "after" );
	equal( orig, obj.pow10, "obj.pow10 should refer to original function after f2 removal" );
	
});



test("5. arrays", function(){
	var obj = {
			f1: function(){},
			f2: function(){},
			f3: function(){}
		};	
	var cnt = 0;
	aspect.add( obj, ["f1","f3"], function(){++cnt} );
	obj.f1(); obj.f2(); obj.f3();
	
	equal( cnt, 2, "Aspect function should be registered for two methods" );
	
	var cnt2 = 0;
	aspect.add( obj, ["f1","f2","f3"], function(){++cnt2}, "after", true );
	obj.f1(); obj.f2(); obj.f3();
	
	equal( cnt2, 3, "Same as previous - even when 'once' attribute is set" );
});


test("6. regexps", function(){
	var obj = {
			f1: function(){},
			f2: function(){},
			f33: function(){},
		};	
	var cnt = 0;
	aspect.add( obj, /^f.$/, function(){++cnt} );
	obj.f1(); obj.f2(); obj.f33();
	
	equal( cnt, 2, "Aspect function should be registered for two methods" );
	
	var cnt2 = 0;
	aspect.add( obj, /^f.$/, function(){++cnt2}, "after", true );
	obj.f1(); obj.f2(); obj.f33();
	
	equal( cnt2, 2, "Same as previous - even when 'once' attribute is set" );
});

