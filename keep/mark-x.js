/*
    program = xtml.js
    for = makes writing more easier for html
    version = 0.1
    license = none	
    releaseDate = apr16/2025 +7
    by = @devster
*/

const fs = require('fs')

async function xRead(FILE) { //test=ok
  try {
    const content = fs.readFileSync(FILE, 'utf8')
    return content
  } catch (err) {
    console.error('! error/read:', err)
    throw err
  }
}

async function xWrite(CONTENT, FILE) { //test=ok
  try {
    fs.writeFileSync(FILE, CONTENT, 'utf8')
    console.log('! done/write')
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

// node xtml FILE_INPUT
const FILE_INPUT = process.argv[2]

xRead( FILE_INPUT).then( conTent => {

  // check \n
  //let arrayRead = content.split('\n')
  

  /* 
  let arrayTrans = arrayRead.map( v => {
    if ( v.includes('=')) {
      let arr = v.split('=')
      return { [ arr[0].trim() ] : arr[1].trim() }
    } else if (v == '') { // blank line
      return { br: 0 }
    } else if ( v.match(/^\.\s.+/) ) { // . sssss
      return { ul: v }
    } else if ( v.match(/^\d\s.+/)) { // 1 ssssss
      return { ol1: v }
    } else if ( v.match(/^\d\)\s.+/) ) { // 1) ssssss
      return { ol2: v }
    } else if ( v.match(/^|\s.+/) ) {
      return { quote: v }
    } else {
      return { p: v }
    }
  }) */

/*
  let xyz = content.match(/\[\[(.*?)\]\]/s)
  let arraY = xyz[1].split('\n')
  let outpuT = []
  arraY.forEach(v => {
    if (v) {
      if (v.includes(' = ')) {
        let [ key, value ] = v.split(' = ')
        outpuT.push(
          { [key.trim()] : value.trim() }
        ) 
      }
    }
    
  })
  console.log( outpuT)

  // check title
  let h1Check = content.match(/^#\s(.+)\n$/m)
  console.log('<h1>' + h1Check[1] + '</h1>')
*/


  // break all into lines
  let allLine = conTent.split('\n')
  let allContentLine = []

  // work on variables............................................
  let varMode = false
  let newVar = {
    //template: 'put template name here'
  }

  allLine.forEach( line => {
    if ( !varMode && line.match(/^\{\{/)) { // start var
      varMode = true
    } else if ( varMode && !line.match(/^\}\}/)) { // this is each var

      let parT = line.split(' = ')
      newVar[ parT[0].trim() ] = parT[1].trim()

    } else if ( varMode && line.match(/^\}\}/)) {
      varMode = false
    } else {
      allContentLine.push(line) // this is not var, it's content
    }
  })

  console.log( 'this is Var:', newVar )


  //get array of raw content
  //console.log( 'var block:', arrayVar)
  //console.log( 'content block:', allContentLine )


  // work on content lines...................................
  for (i=0; i < allContentLine.length; i++) {
    
    let linE = allContentLine[i]

    // title
    if (linE && !linE.match(/^\<\</)) {
      if ( linE.match(/^#\s/)) {
        allContentLine[i] = '<h1>' + linE + '</h1>'
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
  console.log( 'converted to html:', allContentLine)

}).then( f => process.exit(0) )

