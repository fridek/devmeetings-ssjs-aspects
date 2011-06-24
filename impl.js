/*
Stwórz obiekt aspect z następującymi metodami:
add, która ma za zadanie podpiąć funkcję aspectFn pod wykonanie metody fnName w obiekcie obj. 
Metoda przyjmuje następujące parametry:
   obj – referencja do obiektu (w przypadku null/undefined – odwołanie do obiektu globalnego)
   fnName – nazwa funkcji (string || array || regexp)
   aspectFn – funkcja 'aspektowa'
   when – string 'after' lub 'before' (domyślnie 'before')
   once – boolean; jeśli true aspekt wykona się tylko raz (domyślnie false)
   
remove – usuwa wcześniej zadeklarowany aspekt; parametry wejściowe: 
   obj, 
   fnName, 
   aspectFn, 
   when 
   
Jeśli fnName nie jest metodą obiektu obj, metody rzucają TypeError.
Jeśli obj nie wskazuje na obiekt - TypeError (jeśli obj null/undefined to ma wskazywać na obiekt globalny)
fnName może być tablicą funkcji bądź wyrażeniem regularnym, np. /get.+/
 */

(function() {
    var id = 0;
    uniqueId = function (obj) {
        if ( typeof obj.__uniqueid == "undefined" ) {
            obj.__uniqueid = ++id;
        }
        return obj.__uniqueid;
    };

    var aspect = {

        aspects: {},

        /**
         *
         * @param obj
         * @param fnName
         * @param aspectFn
         * @param when
         * @param once
         */
        add: function (obj, fnName, aspectFn, when, once) {
            var i, that = this;

            if(fnName.constructor == Array) {
                for(i in fnName) that.add(obj, fnName[i], aspectFn, when, once);
            }

            if(fnName.constructor == RegExp) {
                for(i in obj) if(i.match(fnName)) that.add(obj, i, aspectFn, when, once);
            }

            if(obj === null || obj === undefined) {obj = window; }
            if(!(obj instanceof Object)) {throw TypeError("invalid obj type"); }
            if(when === undefined) {when = 'before'; }
            if(once === undefined) {once = false; }

            var objectID = uniqueId(obj);

            if(!this.aspects[objectID]) this.aspects[objectID] = {};
            if(!this.aspects[objectID][fnName]) this.aspects[objectID][fnName] = [];

            var tmpF;
            if(this.aspects[objectID][fnName].length == 0) {
                tmpF = obj[fnName];
            } else {
                tmpF = this.aspects[objectID][fnName][0].tmpF;
            }

            this.aspects[objectID][fnName][that.aspects[objectID][fnName].length] = {
                fun: aspectFn,
                when: when,
                once: once,
                tmpF: tmpF
            };

            obj[fnName] = function() {
                var asp = that.aspects[objectID][fnName];

                for(i=0; i < asp.length; i += 1){
                    if(asp[i].when === 'before') {
                        asp[i].fun();

                        if(asp[i].once === true) {
                            asp.splice(i, 1);
                            i--;
                            if(asp.length == 0) obj[fnName] = tmpF;
                        }
                    }
                }

                var ret = tmpF.apply(obj, arguments);

                for(i=0; i < asp.length; i += 1){
                    if(asp[i].when === 'after') {
                        asp[i].fun();

                        if(asp[i].once === true) {
                            asp.splice(i, 1);
                            i--;
                            if(asp.length == 0) obj[fnName] = tmpF;
                        }
                    }
                }

                return ret;
            }
        },

        /**
         *
         * @param obj
         * @param fnName
         * @param aspectFn
         * @param when
         */
        remove: function (obj, fnName, aspectFn, when) {
            var that = this, i, tmpF;
            var objectID = uniqueId(obj);

            if(that.aspects[objectID][fnName].length == 0) {return; }

            for(i in that.aspects[objectID][fnName]){
                if(that.aspects[objectID][fnName][i].fun === aspectFn && that.aspects[objectID][fnName][i].when === when) {
                    tmpF = that.aspects[objectID][fnName][i].tmpF;
                    that.aspects[objectID][fnName].splice(i, 1);
                    if(that.aspects[objectID][fnName].length == 0) {
                        obj[fnName] = tmpF;
                    }
                }
            }


        }
    };

    window.aspect = aspect;
}());