// import in caolan forms
const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createPosterForm = (media_properties, tags) => {
    return forms.create({
        'title': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators':[validators.integer()]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'date': fields.date({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.date(),
            widgetAttrs: {
                class: 'form-control'
            },
            cssClasses: {
                label: ['form-label']
            }
        }),
        'stock': fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.integer()],
        }),
        'height': fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.integer()],
            
        }),
        'width': fields.number({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.integer()],
        }),
        'mediaproperty_id': fields.string({
            label:'MediaProperty',
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'widget': widgets.select(),
            'choices': media_properties
        }),
        'tags': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices:tags
        }),
        'image_url':fields.string({
            widget: widgets.hidden()
        })

    })
}

const createRegistrationForm = () => {
    return forms.create({
        'username': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'email': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'confirm_password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            validators: [validators.matchField('password')]
        })
    })
}

const createLoginForm = () => {
    return forms.create({
        'email': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
    })
};

const createSearchForm = (media_properties, tags) => {
    return forms.create({
        'title': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            }
        }),
        'min_cost': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
          'max_cost': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
        'min_height': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
          'max_height': fields.string({
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            'validators': [validators.integer()]
        }),
        'mediaproperty_id': fields.string({
            label: 'MediaProperty',
            required: false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.select(),
            choices: media_properties
        }),
        'tags': fields.string({
            required:false,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices: tags
        }),
    })
}


module.exports = { createPosterForm,
    createRegistrationForm,
    createLoginForm,
    createSearchForm,
     bootstrapField };