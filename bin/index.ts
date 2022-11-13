const fs = require('fs');
const HTMLParser = require('node-html-parser');

var accordion_counter = 0
/**
 * Setup markdown-it
 */

let settings = JSON.parse(fs.readFileSync('settings.json', 'utf-8'))
let load_list = fs.readFileSync('template/index_list.html').toString();
let load_list_item = fs.readFileSync('template/index_list_item.html').toString();
let load_definition = fs.readFileSync('template/definition.html').toString();
let load_question_template = fs.readFileSync('template/question.html').toString();
let load_dropdown_item = fs.readFileSync('template/dropdown-item.html').toString()
// console.log(load_question_template)
var [question_template_begin, question_template_end] = load_question_template.split('{{acc-answer}}')
var [define_template_begin, define_template_end] = load_definition.split('{{DEFINITION}}')
// console.log(question_template_begin, "\n\n", question_template_end)

var md = require('markdown-it')(
    {

        html: true,
        linkify: true,
        typographer: true,
        modifyToken: function (token, _) {
            // console.log(token)
            switch (token.type) {
                case 'table_open':
                    token.attrObj.class = 'table table-bordered table-striped'
                    break;
                case 'blockquote_open':
                    token.attrObj.class = 'blockquote'
            }
        }
    }
).use(require('markdown-it-modify-token'));
md.use(require('markdown-it-abbr'))
md.use(require('markdown-it-footnote'))
md.use(require('markdown-it-sup'))
md.use(require('markdown-it-sub'))
md.use(require('markdown-it-emoji'))

md.use(require('markdown-it-container'), 'question', {

    validate: function (params) {
        return params.trim().match(/^question\s+(.*)$/);
    },

    render: function (tokens, idx) {
        var m = tokens[idx].info.trim().match(/^question\s+(.*)$/);
        if (tokens[idx].nesting === 1) {

            accordion_counter += 1
            // opening tag
            // console.log("m[1]", md.utils.escapeHtml(m[1]))
            let question = md.renderInline("Question: " + m[1])
            return question_template_begin.replaceAll('{{acc-id}}', accordion_counter).replaceAll('{{acc-question}}', question)
        } else {
            console.log(m)
            // closing tag
            return question_template_end
        }
    }
});

md.use(require('markdown-it-container'), 'definition', {

    validate: function (params) {
        return params.trim().match(/^define\s+(.*)$/);
    },

    render: function (tokens, idx) {
        var m = tokens[idx].info.trim().match(/^define\s+(.*)$/);
        if (tokens[idx].nesting === 1) {

            accordion_counter += 1
            // opening tag
            // console.log("m[1]", md.utils.escapeHtml(m[1]))
            let term = md.renderInline("Define: " + m[1]);
            return define_template_begin.replaceAll('{{TERM}}', term)
        } else {
            console.log(m)
            // closing tag
            return define_template_end
        }
    }
});
/**
 * Setup Notes Parser
 */


const folder = 'notes/'
function dropdown_generation(dict) {
    let str = '<li><a class="dropdown-item" href="{{dropdown-href}}">{{dropdown-name}}</a></li>'


}
let mk_question = []
let mk_definition = []
let template = fs.readFileSync('template/template_note.html').toString()
    .replace('{{NAVBAR_TITLE}}', settings.navbar_name)
var nav_bar_lectures = {}
var lecture_dict = {}
let input_files = fs.readdirSync(folder)
input_files.forEach(file => {
    let name_is_going_to_be = file.replace(/\.[^/.]+$/, "") + '.html'
    file = folder + file
    let rendered_text = md.render(fs.readFileSync(file).toString())
    // console.log(rendered_text)
    let html_parse = HTMLParser.parse(rendered_text)
    let div = html_parse.getElementsByTagName('div')

    // let mk_question = div.filter(div_elem => div_elem.classList.contains('mkn-question'))
    // let mk_answer = div.filter(div_elem => div_elem.classList.contains('mkn-answer'))
    // for (let i = 0; i < mk_question.length; i++) {
    //     question_list[mk_question[i].innerHTML] = mk_answer[i].innerHTML
    // }

    // let mk_term = div.filter(div_elem => div_elem.classList.contains('mkn-term'))
    // let mk_definition = div.filter(div_elem => div_elem.classList.contains('mkn-definition'))
    // for (let i = 0; i < mk_term.length; i++) {
    //     definition_list[mk_term[i].innerHTML] = mk_definition[i].innerHTML
    // }
    mk_question.push(div.filter(elem => elem.classList.contains('mk-acc-question')).map(elem => elem.outerHTML).join('\n'))
    mk_definition.push(div.filter(elem => elem.classList.contains('mk-acc-definition')).map(elem => elem.outerHTML).join('\n'))

    let title = html_parse.getElementsByTagName('h1')[0].childNodes[0]._rawText

    nav_bar_lectures[title] = name_is_going_to_be

    let output = template.replace('{{LECTURE_NOTES}}', rendered_text).replace('{{head-title}}', settings.html_title_prefix + " - " + title)
    lecture_dict[name_is_going_to_be] = output

});
// console.log(Object.entries(nav_bar_lectures))
// console.log(load_dropdown_item)
var nav_bar_dropdown = ''
console.log(mk_question)


let index_text = template
let index_list_items = ''

for (const [key, value] of Object.entries(nav_bar_lectures)) {

    index_list_items += load_list_item.replaceAll('{{i-i-href}}', value).replaceAll('{{i-i-text}}', key) + '\n'
    nav_bar_dropdown = nav_bar_dropdown + "\n" +
        load_dropdown_item.replaceAll('{{dropdown-href}}', value).replaceAll('{{dropdown-name}}', key)
}


for (const [name_is_going_to_be, output] of Object.entries(lecture_dict)) {
    console.log(output)
    fs.writeFile('compiled/' + name_is_going_to_be, output.replace("{{LECTURE_DROPDOWN}}", nav_bar_dropdown), err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    });
}

let index_list = load_list.replace(' {{list-items}}', index_list_items)
console.log(index_list_items)
fs.writeFile('compiled/' + 'index.html', index_text.replace('{{LECTURE_NOTES}}', index_list).replace("{{LECTURE_DROPDOWN}}", nav_bar_dropdown)
    .replace('{{head-title}}', settings.html_title_prefix), err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    });


fs.writeFile('compiled/' + 'questions.html', index_text.replace('{{LECTURE_NOTES}}', mk_question.join('\n')).replace("{{LECTURE_DROPDOWN}}", nav_bar_dropdown)
    .replace('{{head-title}}', settings.html_title_prefix), err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    });
fs.writeFile('compiled/' + 'definitions.html', index_text.replace('{{LECTURE_NOTES}}', mk_definition.join('\n')).replace("{{LECTURE_DROPDOWN}}", nav_bar_dropdown)
    .replace('{{head-title}}', settings.html_title_prefix), err => {
        if (err) {
            console.error(err);
        }
        // file written successfully
    });

let question_html = question_template_begin
// console.log(settings)