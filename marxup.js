/*
    program = xtml.js
    for = makes writing more easier for html
    version = 0.1
    license = none	
    releaseDate = apr16/2025 +7
    by = @devster
*/

const fs = require('fs')

async function xRead(FILE_NAME) { //test=ok
  try {
    const content = fs.readFileSync(FILE_NAME, 'utf8')
    return content
  } catch (err) {
    console.error('! error/read:', err)
    throw err
  }
}

async function xWrite(CONTENT, FILE_NAME) { //test=ok
  try {
    fs.writeFileSync(FILE_NAME, CONTENT, 'utf8')
    console.log('! done/write to file name: ' + FILE_NAME )
  } catch (err) {
    console.error('! error/write', err)
  }
}


// test func
/* this test block is work

if (process.argv[2]) {

  xRead( process.argv[2] ).then( content => {
    console.log( content)
    process.exit(0)
  }).catch(err => {
    console.error('! unhandled error:', err)
    process.exit(1)
  })

} else {
  //if not para we just write this text
  xWrite('this my content', 'test-write.txt')

}
*/

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

  // work on variables............................................
  let varMode = false
  let theVar = {
    //template: 'put template name here'
  }

  allLine.forEach( line => {
    if ( !varMode && line.match(/^\{\{/)) { // start var
      varMode = true
    } else if ( varMode && !line.match(/^\}\}/)) { // this is each var

      let parT = line.split(' = ')
      theVar[ parT[0].trim() ] = parT[1].trim()

    } else if ( varMode && line.match(/^\}\}/)) {
      varMode = false
    } else {
      allContentLine.push(line) // this is not var, it's content
    }
  })

  console.log( 'this is Var:', theVar )


  //get array of raw content
  //console.log( 'var block:', arrayVar)
  //console.log( 'content block:', allContentLine )


  // work on content lines...................................
  for (i=0; i < allContentLine.length; i++) {
    
    let linE = allContentLine[i]

    // title
    if (linE && !linE.match(/^\<\</)) {
      if ( linE.match(/^#\s/)) {
        allContentLine[i] = '<h1>' + linE.slice(2) + '</h1>'
      } else {
        allContentLine[i] = '<p>' + linE + '</p>'
      }
    }
    


    // covert the **.....** to bold
    allContentLine[i] = allContentLine[i].replaceAll(
      /\*\*.+?\*\*/g, (matchedText => {
        return `<b>${ matchedText.slice(2,-2) }</b>`
      })
    )

    // convert //......// to italic
    allContentLine[i] = allContentLine[i].replaceAll(
      /\/\/.+?\/\//g, (matchedText => {
        return `<i>${ matchedText.slice(2,-2) }</i>`
      })
    )

    // convert __sssssss__ for underline
    allContentLine[i] = allContentLine[i].replaceAll(
      /__.+?__/g, (matchedText => {
        return `<u>${ matchedText.slice(2,-2) }</u>`
      })
    )

    
  }
  //console.log( 'converted to html:', allContentLine)

  let formatContent = allContentLine.join('')


  // work on template............................................
  if ( theVar.template ) {
    xRead( theVar.template ).then( temCont => {
      
      console.log( temCont )

      // fill all the var
      for (key in theVar) {
        let patterN = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`,'g')
        temCont = temCont.replaceAll(
          patterN, theVar[key]
        )
      }

      // put the user content into the template
      temCont = temCont.replace(
        /\{\{\s*\$content\s*\}\}/,
        formatContent
      )

      console.log('completed content:', temCont )

      // write file
      if (!FILE_OUTPUT) FILE_OUTPUT = FILE_INPUT.replace('.xtml','.html')
      xWrite( temCont, FILE_OUTPUT )    
    })

  } else {
    // write to output file........................................
    if (!FILE_OUTPUT) FILE_OUTPUT = FILE_INPUT.replace('.xtml','.html')
    xWrite( formatContent, FILE_OUTPUT )
  }


  

}).then( f => process.exit(0) )

