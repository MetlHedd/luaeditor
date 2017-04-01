class moduleapi{
    /**
     * 
     * @param {string} title 
     * @param {array} elements 
     * @param {object} bootbox 
     */
    constructor(title, elements, bootbox){
        this.title = title;
        this.elements = elements;
        this.bootbox = bootbox;
        this.html = "";
        let self = this;
        this.elements.forEach(function(elm){
            console.log(elm)
            if(elm.type == "boolean"){
                self.html += '<div class="form-group"><label>'+elm.name+'</label><select id="'+elm.id+'" class="form-control"><option value="true">True</option><option value="false">False</option></select></div>'
            } else{
                self.html += '<div class="form-group"><label>'+elm.name+'</label><input type="'+elm.type+'" class="form-control" id="'+elm.id+'" value="'+elm.value+'" placeholder="'+elm.ph+'"></div>';
            }
        });
    }
    /**
     * 
     * @param {function} callback 
     */
    generate(callback){
        let self = this
        this.bootbox.dialog({
            title: self.title,
            message: self.html,
            buttons: {
                confirm: {
                    label: 'Ok',
                    className: 'btn btn-raised btn-success',
                    callback: function(){
                        let script = self.title+"(";
                        self.elements.forEach(function(elm, index){
                            if(elm.type == "boolean"){
                                script += $("#"+elm.id+" :selected").val()
                            } else{
                                script += $("#"+elm.id).val()
                            }
                            if(index+1<Object.keys(self.elements).length) script += ", "
                        });
                        script += ")"
                        callback(script)
                    }
                },
                cancel: {
                    label: 'Cancel',
                    className: 'btn btn-raised btn-danger'
                }
            }
        });
    }
}

module.exports = moduleapi;