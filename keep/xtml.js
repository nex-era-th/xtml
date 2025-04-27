/*
    program     = xtml.js
    for         = makes writing more easier for html. You write in xtml format and people also be readable and even converting to html it also presentable in html
    version     = 1.0.1
    license     = none	
    releaseDate = 21:08 apr19/2025 +7
    lastUpdate  = 23:46 apr25/2025 +7
    by          = @devster
*/
/*
    IDEA BEHIND THIS

    The Markdown is good but we just need something that more easier and be able to convert to html quickly. So people can just reading by this format, .xtml, or just convert right away to html. Most of all, we try to make it as clean as possible. So not very much of the headache symbols inside your plain xtml text.

    Don't have name for it yet, just call it the XTML program.

    EXAMPLE

    ----------------------------------------

    # This is title

    [[ $img = xyz.jpg ]]

    This is paragraph.............

    . bullet aaaa
    . bullet bbbbb
    . bullet ccccc

    1 list number aaa
    2 list bbbbb
    3 list ccccc

    Please read more at [[ $url = http://nex-era.xyz/content ]]

    {{ $date }}

    ----------------------------------------

    we like to make it simple but yet somethings are beyond the Markdown thing, for example you can set variables, using template, putting some js codes into your document. The above exam you see the $date variable, only this is beyond the Markdown already.

    More info will put in the guide/help.

    LITTLE FEATURES
    
    . id setting
    . class setting
    . variable setting
    . template
    . links for both inside & outside doc
    . picture
    . block or <div> support


    TECH STUFF

    we use nodejs.
*/





const { xRead, xWrite } = require('./simple-file.js')



// set up............................................................

// node marxup FILE_INPUT FILE_OUTPUT
let FILE_INPUT = process.argv[2]
let FILE_OUTPUT = process.argv[3]

if (!FILE_INPUT) {
  console.log('! must have at least the FILE_INPUT')
  return
}

if ( !FILE_INPUT.match(/\.xtml$/) ) FILE_INPUT = FILE_INPUT + '.xtml'


// start work....................................................
xRead( FILE_INPUT ).then( conTent => {

  // break all into lines
  let allLine = conTent.split('\n')
  let allContentLine = []
  let codeBlockMode   = false // we'll take <pre><code> + js here

  let varMode = false
  let theVar = {
    //template  : '', // default key, so user can't dup
    //date      : '',
    //timeStamp : ''        ^ not true, any key can be dup anyway
  }                           //@devster



  /////////////////////////////////////////////////////////////////////
  // work on variable........................................variables
  // support only 1 var / xtml file
  /*
  
  the main var has to be in this format
  
  {{
      varName = value <<--must have space around the =
      varName = value
      ...
  }}
  
  */

  allLine.forEach( line => {

    // if not in codeBlock just parsing the vars
    if ( line != '' && line.match( /^\[c\]\s*$/)) {
      // codeBlock starts
      allContentLine.push( line)
      codeBlockMode = true

    } else if ( line != '' && line.match( /^\[c\.\]\s*$/)) {
      // codeBlock stops
      allContentLine.push( line)
      codeBlockMode = false
    
    } else if ( line != '' && codeBlockMode == false 
      && varMode == false && line.match(/^\{\{\s*$/) ) { 
      
      // start var
      varMode = true


    } else if ( line != '' && codeBlockMode == false 
      && varMode == true && line.includes(' = ')  
      && !line.match(/^\}\}/)  ) { 
      
      // this is each var
      let parT = line.split(' = ')
      theVar[ parT[0].trim() ] = parT[1].trim()

      
    } else if ( line != '' && codeBlockMode == false 
      && varMode == true && line.match(/^\}\}\s*$/)  ) {

      varMode = false //end var mode

    } else {
      // the rest is considered the content, not var
      allContentLine.push( line ) 
    }
  })


  // theVar can also have var inside for example: xyz = {{ $date }}
  // so user can put global var into theVar object as well
  // right now, we can have $date

  for ( eAch in theVar ) {
    if ( theVar[ eAch ].toString().includes('$date') ) {
      
      let thereIsDateVar = theVar[ eAch ].toString().match(/\{\{\s*\$date\s*\}\}/)
      
      if ( thereIsDateVar ) {
        theVar[ eAch ] = theVar[ eAch ].replace(
          thereIsDateVar, new Date
        )
      } // tested=ok

    } else if ( theVar[ eAch ].toString().includes('$timeStamp') ) {

      let thereIsTimeStampVar = theVar[ eAch ].toString().match(/\{\{\s*\$timeStamp\s*\}\}/)

      if ( thereIsTimeStampVar ) {
        theVar[ eAch ] = theVar[ eAch ].replace(
          thereIsTimeStampVar, Date.now()
        )
      }
    }
  } 


  ///////////////////////////////////////////////////////////////////
  // work on content lines..............................content line

  let bulletMode      = false // . sssssss
  let bulletModeBlankLineCount = 0 //use to break from <ul>
  let numberListMode  = false // 1 sssssss
  let numberListBlankLineCount = 0 //use this to break from <ol>
  let divMode         = false // [#id.class-a.class-b 
  let blockQuoteMode  = false // " 
  let htmlBlockMode   = false // true if it has no close tag </>
  let tableMode       = false // table mode
  let tableHeadSet    = true  // the first line will be the head


  for (i=0; i < allContentLine.length; i++) {
    let linE = allContentLine[i]

    /*
      if we take off the checking linE != '' , the program will fault
      Reason behind this is to check if it is a pure blank line then
      we just leave it, don't touch.
      Some blocks use this '' (blank line) to work in its code.
      ! So careful not to remove it.
    */
    /* 
      we'll do this as our codeBlock

      [c]
          .......
          ..............
      [c.]

      so anything inside the [c]...[c] block will be preserved and showing in code font. So actually we do it in <pre><code>...</code></pre> but + a little js to escape the < > &
    */


    if ( linE != '' && linE.match( /^\[c\]\s*$/) && codeBlockMode == false) {

      // start of the <pre> ==> [c]
      // we do nothing just leave everything as it is
      allContentLine[i] = '<pre style="white-space: pre-wrap"><code>'
      codeBlockMode = true

    } else if ( /*linE != '' &&*/ codeBlockMode == true && !linE.match(/^\[c\.\]\s*$/) ) { 

      // anything inbetween the [c]...[c.] block, escape for < > &
      allContentLine[i] = getEscapeHtmlCodeFrom( linE ) + '\n'
            

    } else if ( linE != "" && linE.match( /^\[c\.\]\s*$/ ) && codeBlockMode == true ) { 

      // close of pre block or </pre> ==> [c.]
      allContentLine[i] = '</code></pre>'
      codeBlockMode = false






      // . sssss ==> <ul><li>
    } else if ( linE != '' && linE.match(/^\.\s.+/) && bulletMode == false ) {
      // start of the bullet
      let thereIsAttrib = getAttrib( linE )
      if ( thereIsAttrib ) {
        allContentLine[i] = `<ul ${ thereIsAttrib }><li>` + linE.slice(2) + '</li>'
        allContentLine[i] = allContentLine[i].replace(/\s\[[\w#.-]+\]\s*/, '') // delete the tailMark

      } else {
        allContentLine[i] = '<ul><li>' + linE.slice(2) + '</li>'
      }
      bulletMode = true

    } else if ( linE != '' && linE.match(/^\.\s.+/) && bulletMode == true ) { 
      // more <li>
      allContentLine[i] = '<li>' + linE.slice(2) + '</li>'

    } else if ( linE == '' && bulletMode == true ) {

      allContentLine[i] = '</ul>'
      bulletMode = false // end bulletMode











      // work on <div> here the line is [[#id.class-a.classb
    } else if ( linE != '' && linE.match( /^\[\[[\w\s#-.]*$/ ) && divMode == false) {

      // start of the <div>
      let thereIsAttrib = getAttrib( linE, 'div' )

      if ( thereIsAttrib ) {
        allContentLine[i] = `<div ${ thereIsAttrib }>` 
      } else {
        allContentLine[i] = '<div>'
      }
      divMode = true

    /*} else if ( divMode == true && linE == '') {
      // while in Block Mode, each '' will be <br>
      allContentLine[i] = '<br>'*/

    } else if ( linE != '' && divMode == true && 
      linE.match( /^\]\]\s*$/ ) ) {

      // end of block or </div> is only ]] in the line
      allContentLine[i] = '</div>'
      divMode = false        



      // blockQuoteMode " ....start ==> <blockquote>
    } else if ( linE != '' && linE.match( /^".*$/) && blockQuoteMode == false ) { 

      // support #id.class =>> "#id.class because guys usually put class for this thing
     
      let thereIsAttrib = getAttrib( linE, 'blockQuote')
      if ( thereIsAttrib ) {
        allContentLine[i] = `<blockquote ${ thereIsAttrib }>`
      } else {
        allContentLine[i] = '<blockquote>'
      }
      blockQuoteMode = true


      // blockQuoteMode " .....stop ==> </blockquote>
    } else if ( linE != '' && linE.match( /^"\s*$/) && blockQuoteMode == true ) {

      allContentLine[i] = '</blockquote>'
      blockQuoteMode = false




      // table is the block of [t]......[t.] ==> <table>......</table>
    } else if ( linE != '' && linE.match( /^\[t\][#.\w\-]*$/) 
        && tableMode == false && tableHeadSet == true ) {   

      tableMode = true
      let hasAtt = linE.match( 
        /^\[t\](#[\w]+?)?((\.[\w\-]+?)+?)?\s*$/
      )

      if (hasAtt) {
        let idAtt = hasAtt[1]? `id="${ hasAtt[1].slice(1) }"` : ''
        let classAtt = hasAtt[2]? `class="${ hasAtt[2].split('.').filter(v => v).join(' ') }"` : ''

        let htmlCode = '<table '
        if ( idAtt ) {
          htmlCode += idAtt
          if ( classAtt ) {
            htmlCode += ' ' + classAtt + '>'
          } else {
            htmlCode += '>'
          }
        } else {
          htmlCode += classAtt + '>'
        }

        //so we got like <table id="..." class="...">
        allContentLine[i] = htmlCode

      } else {
        allContentLine[i] = '<table>'
      }


      // table head
    } else if ( linE != '' && tableMode == true 
        && tableHeadSet == true) { 

      tableHeadSet = false
      let headArr = allContentLine[i].split('|')
      headArr = headArr.map(v => v.trim())
      let htmlCode = '<tr>'

      headArr.forEach( headText => {
        htmlCode += '<th>' + headText + '</th>'
      })

      htmlCode += '</tr>'
      allContentLine[i] = htmlCode


      // table body
    } else if ( linE != '' && tableMode == true 
        && tableHeadSet == false && !linE.match( /^\[t.\]\s*$/)) { 

      let bodyArr = allContentLine[i].split('|')
      bodyArr = bodyArr.map(v => v.trim())
      let htmlCode = '<tr>'

      bodyArr.forEach( bodyText => {

        // check if bodyText has some classes like .r, .c or any the apply the classes too
        // this is bodyText content ==> ssssssss .r
        //we only support class in the <td> 
        /*

        set class in data cells of the table by

        | Product     | Price
        | xyz         | 1,000.00 .r

                                  ^ just put a <space> and className
                                  many classes can be set too
                                  

        */

        let hasClass = bodyText.match( 
          /\s(\.[\w\-]+?)+?$/ 
        )
        if (hasClass) {
          let theClass= hasClass[0].split('.').filter(v => v.trim()).join(' ')
          bodyText = bodyText.replace( hasClass[0], '').trim()

          //check if has class .n3 we'll make number in 1,000 format
          if (theClass.includes('n3') || theClass.includes('k')) {
            bodyText = n3( bodyText )
          }

          htmlCode += '<td ' + `class="${ theClass }"` + '>' + bodyText + '</td>'

        } else {
          htmlCode += '<td>' + bodyText + '</td>'
        }
      })

      htmlCode += '</tr>'
      allContentLine[i] = htmlCode


      // table end
    } else if ( linE != '' && tableMode == true 
        && linE.match( /^\[t.\]\s*$/) ) { 

      tableMode = false
      tableHeadSet = true
      allContentLine[i] = '</table>'


//move 1 line conversions here---------------------------------



     
    //don't move this block up it will affect the formating of table      
    // 1 sssssss ==> <ol><li>sssssss
    } else if ( linE != '' && linE.match(/^1\s.+/) && numberListMode == false) { 

      // start of number list 
      let thereIsAttrib = getAttrib( linE )
      if ( thereIsAttrib ) {
        allContentLine[i] = `<ol ${ thereIsAttrib }><li>` + linE.slice(2) + '</li>'
        allContentLine[i] = allContentLine[i].replace(/\s\[[\w#.-]+\]\s*/, '') // delete the tailMark

      } else {
        allContentLine[i] = '<ol><li>' + linE.slice(2) + '</li>'
      }
      numberListMode = true

    } else if ( linE != '' && linE.match(/^\d+?\s.+/) && numberListMode == true) { 

      // more number list
      allContentLine[i] = '<li>' + linE.slice(2) + '</li>'

    } else if ( linE == '' && numberListMode == true && numberListBlankLineCount == 0) {

      //must be 2 blank lines to break from the list
      if ( allContentLine[i-1] == '') {
        // end of numberList
        allContentLine[i] = '</ol>'
        numberListMode = false
      }


 










      // # ssssss ==> <h1>sssssss
    } else if ( linE != '' && linE.match(/^#\s.+/)) { // # ssssss
      let thereIsAttrib = getAttrib( linE )
      if ( thereIsAttrib ) {
        allContentLine[i] = `<h1 ${ thereIsAttrib }>` + linE.slice(2) + '</h1>'
        allContentLine[i] = allContentLine[i].replace(/\s\[[\w#.-]+\]\s*/, '') // delete the tailMark
      } else {
        allContentLine[i] = '<h1>' + linE.slice(2) + '</h1>'
      }

      // ## ssssss ==> <h2>ssssssss</h2>
    } else if ( linE != '' && linE.match(/^##\s.+/) ) { // ## sss
      let thereIsAttrib = getAttrib( linE )
      if ( thereIsAttrib ) {
        allContentLine[i] = `<h2 ${ thereIsAttrib }>` + linE.slice(3) + '</h2>'
        allContentLine[i] = allContentLine[i].replace(/\s\[[\w#.-]+\]\s*/, '') // delete the tailMark
      } else {
        allContentLine[i] = '<h2>' + linE.slice(3) + '</h2>'
      }

      // ### ssssssssss ==> <h3>sssssssss</h3>
    } else if ( linE != '' && linE.match(/^###\s.+/) ) { // ### text

      let thereIsAttrib = getAttrib( linE )

      if ( thereIsAttrib ) {
        allContentLine[i] = `<h3 ${ thereIsAttrib }>` + linE.slice(4) + '</h3>'
        allContentLine[i] = allContentLine[i].replace(/\s\[[\w#.-]+\]\s*/, '') // delete the tailMark

      } else {
        allContentLine[i] = '<h3>' + linE.slice(4) + '</h3>'
      }
      //testing













//---------------------------------------------------------------

      // work on exclusion of all html tags here. May check only if the line starts with < then we consider it as html tag, so not convert it.

    } else if ( linE != '' && linE.match( /^\s*<\w.+>\s*$/ ) || htmlBlockMode == true ) {

      // check only <..................>
      // just leave it there, don't touch, as it is html tag

      allContentLine[i] = allContentLine[i] + '\n'

      // now ensure that the line starts with some tag <sss ... then check if there's a close tag like </ssss>
        if ( linE.match( /<\/.+?>\s*$/ ) || linE.match( /^\s*<(img |input )/ )) {

          // there's close tag so this html line not in block-mode
          htmlBlockMode = false

        } else {
          //this html line has no close tag, so it's block-mode
          htmlBlockMode = true
        }




      // -------30--------- is <hr>
    } else if ( linE.match(/-{30,}/) ) {

      // if there're --- 30 chars onwards, this is <hr>
      allContentLine[i] = '<hr>'







      // ssssssssssssssss .... is <p>......</p>
    } else if ( linE != '' && htmlBlockMode == false && !linE.match(/^\s+$/)) {

      // all lines that's not blank, takes it as <p>

      if ( true ) {
        // we do only non-blank line so there's no blank line like <p>   </p>

        let thereIsAttrib = getAttrib( linE )
        if ( thereIsAttrib ) {

          allContentLine[i] = `<p ${ thereIsAttrib }>` + linE + '</p>'
          allContentLine[i] = allContentLine[i].replace(/\s\[[\w#.-]+\]\s*/, '') // delete the tailMark
  
        } else {
          allContentLine[i] = '<p>' + linE + '</p>'
        }
      }
   
      







    } else {
      // for blank line just leave it there
      // change to make it ''
      allContentLine[i] = ''
    }
    
    



/////////////////////////////////////////////////////////////////////
    // followings are inline-formatting...................in line
    // all the in-line formating will be OFF if the codeBlockMode is ON

    if ( codeBlockMode == false ) {
      
      // make <code> by [c].......[c]
      // all lines must be parsed with [c]..[c] no condition
    
      allContentLine[i] = allContentLine[i].replaceAll(
        /\[c\].+?\[c\]/g, (matChed => {
          let esCaped = getEscapeHtmlCodeFrom( matChed.slice(3,-3) )
          return `<code>${ esCaped }</code>`  
        })
      )

     
      let thisLine = allContentLine[i]


      let hasCodeTag = allContentLine[i].match(/<code>?.*?<\/code>/)
      if ( hasCodeTag ) {
        // has <code> in the line

        let allCodePart = [...thisLine.matchAll(/<code>?.*?<\/code>/g) ]

        
        let allPart = [] //split all stings from thisLine into this both code & non-code

        let length = allCodePart.length

        for (j=0; j < length; j++) {
          let thisCodePart = allCodePart[j]
          let lastCodePart = (j == length - 1)

          if (j == 0) {

            if (thisCodePart.index > 0) {
              allPart.push(
                thisLine.slice(0, thisCodePart.index),
  
                thisLine.slice( thisCodePart.index, thisCodePart.index + thisCodePart[0].length ),
              )
            } else {
              allPart.push(
                thisLine.slice( 0, thisCodePart.index + thisCodePart[0].length)
              )
            }
            if (lastCodePart) {
              allPart.push( 
                thisLine.slice( thisCodePart.index + thisCodePart[0].length, thisLine.length)
              )
            }

          } else {
            
            allPart.push(
              thisLine.slice( allPart.join('').length, thisCodePart.index),

              thisLine.slice( thisCodePart.index, thisCodePart.index + thisCodePart[0].length)
            ) 
            if (lastCodePart) {
              allPart.push(
                thisLine.slice( thisCodePart.index + thisCodePart[0].length, thisLine.length)
              )
            }            
          }
        }        

        //now the allPart holds both code & non-code parts so then we need to convert all non-code and then join('') all and get it back to the allContentLine[i]
        

        for (k=0; k < allPart.length; k++) {
          if ( !allPart[k].includes( '<code' ) ) {
            
            //this is non-code part, so convert it all
            //allPart[k] = getHtmlTag( allPart[k], /\*\*([^*]+?)\*\*/g, '<b>' )

            allPart[k] = getAllxTagConverted( allPart[k] , codeBlockMode, theVar )
          }
        }          

        allContentLine[i] = allPart.join('')

      } else {

        // no <code> in the line, just go convert all
        //allContentLine[i] = getHtmlTag( allContentLine[i], /\*\*.+?\*\*/g , '<b>' )

        allContentLine[i] = getAllxTagConverted( allContentLine[i], codeBlockMode, theVar )
      }
     

    } // end of in-line formating block
  } //end for-loop / allContentLine


  // join the array so we get a whole 1 text as html codes
  let formatedContent = allContentLine.join('')



  /////////////////////////////////////////////////////////////////////
  // work on template..........................................template
  if ( theVar.$template ) {
    xRead( theVar.$template ).then( temCont => {
      
      // fill all the var
      for (key in theVar) {
        let patterN = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`,'g')
        temCont = temCont.replaceAll(
          patterN, theVar[key]
        )
      }

      // put the user content into the template so in the template file you have to have the {{ $content }} to tell us that you need to put all xtml content into this position. If you don't have it we don't know where to put into, so we skip.

      temCont = temCont.replace(
        /\{\{\s*\$content\s*\}\}/,
        formatedContent
      )


      // write file -- the FILE_OUTPUT  has to name with .html because we convert it into html format.
      if (!FILE_OUTPUT) {
        FILE_OUTPUT = FILE_INPUT.replace('.xtml','.html')
        //if not provided, use input file name and change to .html
      } else {
        if ( !FILE_OUTPUT.match(/\.html$/)) {
          FILE_OUTPUT = FILE_OUTPUT + '.html'
          // has to be .html name
        }
      }

      xWrite( temCont, FILE_OUTPUT )    
    })

  } else {
    // no $template

    let htmlHeadSection = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"></head>
  <style>
    code { color: #5c6bc0 }
    h2 { font-style: italic }
    h3 { text-decoration: underline }
    table { border-collapse: collapse; width: 100% } 
    table, th, td { border: 1px solid black;  }
    th, td { padding: 4px 8px }
    .indent, .indent-16 { margin-left: 16px }
    .sans-serif, .sans { font-family: sans-serif }
    .mono { font-family: monospace }
    .red { color: red }
    .green { color: green }
    .blue { color: blue }
    .yellow { color: yellow }
    .orange { color: orange }
    .brown { color: brown }
    .gray { color: gray }
    .pink { color: pink }
    .purple { color: purple}
    .indigo { color: #5c6bc0 }
    .c { text-align: center }
    .r { text-align: right }
    .l { text-align: left }
  </style>
<body>`

    let htmlBottomSection = `
</body>
</html>`

    // write to output file........................................
    if (!FILE_OUTPUT) FILE_OUTPUT = FILE_INPUT.replace('.xtml','.html')
    xWrite( 
      htmlHeadSection + formatedContent + htmlBottomSection, 
      FILE_OUTPUT 
    )
  }


  

}).then( f => process.exit(0) )



//////////////////////////////////////////////////////////////////////
// helper func...............................................help func
function getAttrib ( LINE, MODE='normal' ) {
  // LINE is each content line so this func check the line's tailMark: .................... [#id.class1.class2]
  // support only id & class

  let outputAttrib = ''
  let thereIsAttrib

  if ( MODE == 'normal') {
    // check [#id.class-a.class-b]
    thereIsAttrib = LINE.match(/\s\[(#\w+)?((\.[\w-]+)+)?\]\s*$/)
  } else if ( MODE == 'div') {
    // check [#id.class-a.class-b
    thereIsAttrib = LINE.match(/\[(#\w+)?((\.[\w-]+)+)?\s*$/)
  } else if ( MODE == 'blockQuote') {
    // check "#id.class-a.class-b
    thereIsAttrib = LINE.match( /^"(#\w+)?((\.[\w-]+)+)?\s*$/)
  } else if ( MODE == 'span') {
    // input must be: [#id.class.class]
    thereIsAttrib = LINE.match(/\[(#\w+)?((\.[\w-]+)+)?\]$/)
  }

  if ( thereIsAttrib ) {
    if ( thereIsAttrib[1] ) {
      let theId = thereIsAttrib[1].slice(1)
      outputAttrib = `id="${ theId }"` // id="ssss"
    }
  
    if ( thereIsAttrib[2] ) {
      let theClass = thereIsAttrib[2].split('.').filter(v => v).join(' ')
      if ( outputAttrib.length ) {
        outputAttrib += ` class="${ theClass }"`
      } else {
        outputAttrib += `class="${ theClass }"`
      }
    }

    return outputAttrib? outputAttrib : false
    //output is `id="..." class="...."`

  } else {
    return false
  }
}

/* not use
function notBlankLine( LINE ) {
  // to solve even the blank spaces line, we consider blank line because otherwise we'll got a blank <p>     </p>

  let thereIsSpace = LINE.toString().match(/^.*$/)
  if ( thereIsSpace ) return false // line not blank
  else return true // line is blank
}
*/


function getEscapeHtmlCodeFrom( LINE ) {
  // escape the < > & to make them show like html code in browser
  return LINE.replace( /&/g, '&amp;').replace( /</g, '&lt;').replace( />/g, '&gt;')
}




function isThisInCodeBlock( LINE, FROM, TO ) {
  // let notCodeBlock = isThisInCodeBlock( line, 0, 22)
  // FROM is the start point of search
  // TO is the end point of search

  if ( LINE.slice( FROM, TO ).match( /<code>?/) 
        && LINE.slice( TO ).match( /<\/code>/ ) ) {

    return true // if in codeBlock
  } else {
    return false // if not
  }
}



function replaceString( original_str, first_position, length_of_old_str, new_str ) {

  /*
      original_str    = original string to be replaced
      first_position  = index of the old string to be replaced
      length_of_old_str = the old string's length
      new_str         = new string that will replace the ole one

  */

  return original_str.slice( 0, first_position ) + new_str 
  + original_str.slice( first_position + length_of_old_str );

  //tested=ok, @devster
}






function getHtmlTag( string_line, regex_pattern, html_tag, trim_length=2 ) {

  /*

  to            = convert any xTag into html tag
  string_line   = the string to be converted
  regex_pattern = RegExp pattern, should be /g to replace all
  html_tag      = the html tag to replace the has to toxTag, like <p>

  */

  return string_line.replaceAll( 
    regex_pattern , 
    matched => html_tag + matched.slice( trim_length,-trim_length) + '</' + html_tag.slice(1)
  )


  //tested=ok @devster
}




function findThis( strin_g, regex_to_check ) {
  /*

  to              = check if there's something matching the RegExp
  strin_g         = string to check
  regex_to_check  = just put the /.../ in on what you're checking  
  ouput           = true | false

  */
  
  return strin_g.match( regex_of_xtag ) ? true : false
}




function getAllxTagConverted( string_line, codeBlockMode, theVar ) {

  /*
  to          = convert this line of string for all xTags to html
  string_line = string to be converted
  output      = html code
  */

  string_line = getHtmlTag( string_line, /\*\*(.+?)\*\*/g, '<b>')
  string_line = getHtmlTag( string_line, /\/\/.+?\/\//g, '<i>')
  string_line = getHtmlTag( string_line, /__.+?__/g, '<u>')
  string_line = getHtmlTag( string_line, /\[s\].+?\[s\]/g, '<small>', 3)
  string_line = getHtmlTag( string_line, /\["\].+?\["\]/g, '<q>', 3)

  //addition
  string_line = getHtmlTag( string_line, /\[m\].+?\[m\]/g, '<mark>', 3)
  
  
  // plain span {...} ==> <span>...</span>
  if ( !string_line.includes(' ; #') && !string_line.includes(' ; .') ) {

    string_line = getHtmlTag( string_line, 
      /\{[^{\s].+?[^;#.\-}\s]\}/g, '<span>', 1
    ) //tested=ok @devster
    //tested=ok @devster
    //tested=ok changed the span to {...}
  }
  


  //--------------------------------

  // span with attribute {..... ; #id.class} ==> <span id=".." class="..">
  if ( string_line.includes(' ; #') || string_line.includes(' ; .')) {


    /*let allSpanAttrib = [...string_line.matchAll( 
      /\{[^\s]([^{};]+?)\s;\s(#[\w]+?)?((\.[\w\-]+?)+?)?\}/g
    )]*/

    let allSpanAttrib = [...string_line.matchAll( 
      /\{([^\s][^{};]*?)\s;\s(?:#([\w-]+))?(?:((?:\.[\w-]+)+))?\}/g
    )]
      



    allSpanAttrib.forEach( att => {
      let idAtt = att[2]? `id="${ att[2] }"` : ''
      
      let classAtt = att[3]? `class="${ att[3].split('.').filter(v => v).join(' ') }"` : ''

      let attToSet = '<span '

      if (idAtt) {
        attToSet += idAtt
        if (classAtt) {
          attToSet += ' ' + classAtt + '>' + att[1] + '</span>'
        } else {
          attToSet += '>' + att[1] + '</span>'
        }
      } else {
        attToSet += classAtt + '>' + att[1] + '</span>'
      }

      string_line = string_line.replace( att[0], attToSet)
    })

  }
    
  //((\.[\w-]+)+)?


/*
    let allSpanTag = [...string_line.matchAll( 
      /\[\]([^\[\]]+?)(\[[^\[\]]+?\])/g 
    )]
console.log( allSpanTag )

    allSpanTag.forEach( span => {
      let thereIsAttrib = getAttrib( span[2], 'span' )
      
      if (thereIsAttrib) {
        string_line = string_line.replace( span[0], '<span ' + thereIsAttrib + '>' + span[1] + '</span>')
      } else {
        string_line = string_line.replace( span[0], '<span>' + span[1] + '</span>')
      }

    })
    //tested=ok @devster

*/
    


  //-----------------------------------------------------------
  // {{ ... }}

  // check if there is a var {{...}} in the line..........{{ }}
  if ( string_line.match(/\{\{.+\}\}/) && codeBlockMode == false ) {
    
    // fill on system var like $date, etc
    string_line = string_line.replaceAll( // $date

      /*
      you can put {{ $date }} in your doc and you get js date string
      */

      /\{\{\s*\$date\s*\}\}/g, 
      new Date
    )

    string_line = string_line.replace( // $timeStamp
     
      /*
      you can put {{ $timeStamp }} in your text and you get like
      js Date.now() miliseconds number
      */

      /\{\{\s*\$timeStamp\s*\}\}/g,
      Date.now()
    )


    // $randomInt
    string_line = string_line.replace(
      /\{\{\s*\$randomInt\s*\}\}/g, getRandomInt()
    )


    // $randomWords
    string_line = string_line.replace(
      /\{\{\s*\$randomWords\s*\}\}/g, getRandomWords()
    )

    // $randomMix
    string_line = string_line.replace(
      /\{\{\s*\$mixWordNum\s*\}\}/g, getMixWordNum()
    )


    // $isoTimeCondense
    string_line = string_line.replace(
      /\{\{\s*\$isoTimeCondense\s*\}\}/g, getIsoTimeCondense()
    )





    // the user Var can fill in the content too
    for (keY in theVar) {

      /*
      all the vars in your xtml file are be able to present in your doc if you put like {{ yourVarName }}
      */

      //if (keY != 'template') {
        let patterN = new RegExp(`\\{\\{\\s*${keY}\\s*\\}\\}`,'g')
        string_line = string_line.replaceAll(
          patterN, theVar[keY]
        )
      //} <<--any var should be used in the doc /@devster
    }

  }


  //-------------------------------------------------------------




  // work on xTag which is [[ ... ]]...........................[[ ]]
  if ( string_line.match(/\[\[.+?\]\]/)) {

    let allTag = string_line.match(/\[\[.+?\]\]/g) 
    // a line can have many tags and each tag can be different. So we can have $url and $img in the same line

    allTag.forEach( taG => {
      // each taG will get full of '[[................]]'
      let cleanTag = taG.match(/\[\[(.+)\]\]/)[1].trim() // take out brackets
      
      if ( cleanTag.includes('$url') ) { // test=ok
        // [[ my link ; $url = http://nex-era.xyz/sssss ]]

        if ( cleanTag.includes(';')) {
          // 2 parts of $url
          [ linK, urL ] = cleanTag.split(';')
          urL = urL.split('=')[1].trim()
          string_line = string_line.replace(
            taG, `<a href="${ urL }">${ linK.trim() }</a>`
          )

        } else {
          // $url = http://sssssssssss
          let urL = cleanTag.split('=')[1].trim()
          string_line = string_line.replace(
            taG, `<a href="${ urL }">${ urL }</a>`
          )
        }

      } else if ( cleanTag.includes('$img') ) {
        // [[ $img = ./lisa.png ]]
        // always set width to 100%
        let imgPath = cleanTag.split('=')[1].trim()
        string_line = string_line.replace(
          taG, `<img src="${ imgPath }" style="width: 100%">`
        )


      } else if ( cleanTag.includes('$blankLine') ) {
        // this is for $blankLine
        // [[ $blankLine = 24px ]] ... set height to 24px
        // default is 16px height

        let heigHt = '16px' //default

        if ( cleanTag.includes('=')) {
          heigHt = cleanTag.split('=')[1].trim()
        }

        string_line = string_line.replace(
          taG, `<div style="height: ${ heigHt }"></div>`
        )



      } else {
        // we'll take this to the eval()
        if ( cleanTag != '') {
          try {
            string_line = string_line.replace(
              taG, eval( cleanTag )
            )
          } catch (error) {
            // just leave
          }
          
        }
        // if it's a blank, then we do nothing             
      }
    })
    

  }

  return string_line
}



//------------------------------------------------------------


function getRandomInt( leng_th=5 ) {
  if (leng_th <= 0) return 0
  const min = Math.pow(10, leng_th - 1)
  const max = Math.pow(10, leng_th) - 1
  return Math.floor(Math.random() * (max - min + 1)) + min
} //tested=ok @devster



function getRandomWords(leng_th = 8) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < leng_th; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length)
    result += letters[randomIndex]
  }
  return result
}//tested=ok




function getMixWordNum(leng_th = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < leng_th; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    result += chars[randomIndex]
  }
  return result
}//tested=ok


function getIsoTimeCondense() {
  const now = new Date()

  const year   = now.getFullYear()
  const month  = String(now.getMonth() + 1).padStart(2, '0')   // Month is 0-indexed
  const day    = String(now.getDate()).padStart(2, '0')
  const hour   = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')

  return `${year}${month}${day}${hour}${minute}`
}//tested=ok



/*
function n3( num_ber ) {
  // makes raw num like 1000000 to be 1,000,000

  if ( num_ber.match(/^\d+$/) ) return num_ber

  let sTring = num_ber.toString()
  let arraY = []
  while (sTring.length > 0) {
    arraY.unshift( sTring.slice(-3))
    sTring = sTring.slice(0,-3)
  }

  return arraY.join(',')
}
*/

function n3( number ) {

  let str = number.toString();
  if ( !str.match(/^[\d.]+/) ) {
    return number
  } //valid only number & .

  let result = [];

  //work on decimal
  let left = '0', right = '00'
  if (str.includes('.')) {
    [ left, right ] = str.split('.')
    right = right.slice(0,2)
  } else {
    left = str
  }

  // Loop from the end, taking 3 digits each time
  while (left.length > 0) {
    result.unshift(left.slice(-3)); // take last 3
    left = left.slice(0, -3);        // remove last 3
  }

  return result.join(',') + '.' + right
}

//const k = n3 //also name it k()






///////////////////////////////////////////////////////////////////
/* tailNote----------------------------------------------------

time,message,by

18:59 apr17/2025 +7
mostly done, for basic/general use but there'd be little more to enhance
@devster

19:35
now multi-link in a line works.
manual break <br> works
should be nearly v1.0
@devster


! more dev
work with blocks, says in template we have some blocks and the user put her contents in, like in nex-web's blog

supported <hr>
thinking how to support block

==================================
13:13 apr18/2025 +7
done on [#id.class-a.class-b] for the <p>
will have to do more for other tags

you have to put the #id before any .class or you can ommit the #id just start with .class right away. 
can have many classes
the id starts with # and then the \w+
the class starts with . and then the [\w-]+ 
if have many claases just attach them together: .aaaa.bbbb.cccc.dddd


now the [#id.class] works for <p><h1><ul><ol>
for <ul><ol> you have to put at the first line of the group



15:50
nearly done, it's 99% now
the <div> is done with #id.class support
you have to put like this:

[#id.class

## heading 2

paragraph............
............................
...............

]

if you didn't put #id.class it just a blank <div>


====================================

8:06 apr19/2025 +7
workng on <blockquote>, <br> or manual break, <q>

<q> done
<blockquote> done with accepting #id.class . So you do this for <blockquote>

"#id.class

  the quote from someone ssssssss sssssss ssss
  sfasdfasdfasdfasdf
  asdfasdfasdfasdf

"


now working on 'accepting all html tag feature', this means the user can also put the html tags like <p>, <pre> or any tags and they're working as well in the xtml file.
=done & tested=ok

13:51
so now the xtml doesn't touch the html tags, just leave them as it is, so you can do:

<pre>

  let xyz = 5555555
  if () {
  
  } else {
   
  }

</pre>


whatever it is truely work. If you happy to put some html inside the xtml it's nothing wrong with it. For the manual break, we don't do in the xtml but you just take the <br> in it, works fine like:

<p>ssssssssssssssssssssssssssss<br>
ssssssssssssssssssss</p>

then you got manual break easily. 

well! I think this is v1.0 already.



16:29
just added the {{ $date }} feature in the var block, so you can do:

{{
    date = {{ $date }}

}}

it will give you the js new Date format. No need to write it by yourselft. And it's the time when you convert it to html.



16:38
{{ $timeStamp }} is featured in theVar already

17:47
now fixed the blank line of <p>    </p>
v1.0.2



21:09
added [[ $blankLine = 40px ]] ....you can set blank line so we can control the height between each block of content. It utilizes the <div></div> tag.

================================
06:42 apr20/2025 +7
change the block from 
[

..........
................

]

to

[[

..................
...............

]]

to make it more aligned to other tags, which we always used double symbols like ** // __ [[...]] {{...}} so make it more cleaner, same style of coding.











*/


/* #DEBUG----------------------------------------------------------

#100
18:44
when we have like this

[
  ssssssssssssssssss
  sssssssssss
]

<img .....>

[

sssssssssssssssss
ssssssssssssss

]

the block below <img> has <div>...</div> but inside it has no <p>
when take off the <img> it has <p> as normal

>>suspecting something about the htmlBlockMode feature

20:41
fixed bug#100

-----------------------------------------
10:23 #200
now fixing the var code {{...}} doesn't show up in the [c]...[c.] block

bug #200 = fixed / @devster 12:18



----------------------------------
all bug from this point forward will be in the xdb's debug collection.


*/