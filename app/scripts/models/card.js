
class Card {
    
    constructor(services) {
        this.services = services;
        this.name = null;
        this.category = null;        
        this.image = null;
        this.cardsInBoardCount = null;
        this.mappedScales = null;
        this.selected = false;
        this.isLoad = false;
        this.audio = document.getElementById('audio-click-card');
        this.audio.muted = false;
        this.scaleCalculator = function(){
            return 1;
        }
    }

    clickListener(){

        this.audio.play();
        this.toggleSelectedState();
    }

    toggleSelectedState(){
        //console.debug('toggleSelectedState');
        this.selected = !this.selected;
    }

    get cssScale(){
        return this.calcScaleRange();
    }

    calcScaleRange(){
        //this.mappedScales[this.cardsInBoardCount()];
        return this.scaleCalculator();
    }

    between(x, min, max) {
        return x >= min && x <= max;
    }

    preloadImage(callback){
      let _http = this.services.$http;  
      let self = this;

      _http.get(this.image)
        .then(
            function() {
                self.isLoad = true;
                /* $scope.resources.images.loaded += 1;
                $scope.stack.cards.availables[name].status = 'loaded'; */
                callback();
            },
            function(){
                self.isLoad = false;
                console.log('error on get '+this.image);
            }
        );
    }

}

