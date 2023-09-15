let opened = null
function toggleSubMenu(element) {
  // const d
  element.addEventListener('click', (evt) => {
    evt.preventDefault();
    const list = element.querySelector('.sub-menu')
    list.classList.toggle('is-open')
    opened = list
  })
}

// (function() {
//   const subMenus = document.querySelectorAll('.sub-menu')
//   Array.from(subMenus).forEach(menu => menu.addEventListener('click', (evt) => {
//     if(evt.target.tagName !== 'A') return
//     let links = menu.querySelectorAll('a.sub-menu-link')
//     console.log(links)
    
//     Array.from(links).forEach(link => link.classList.remove('selected'))
//     evt.target.classList.add('selected')
//   }))
// })() 

window.addEventListener('click', (evt) =>{
  // close language picker when clicking outside it
  if(!(evt.target.classList.contains('dropdown') || 
  evt.target.parentElement.classList.contains('dropdown')) && opened)  {

    setTimeout(() => {

      opened.classList.remove('is-open')
      opened = null
    },150)
  }
  // add selected class to clicked link
  if(evt.target.classList.contains('sub-menu-link') && opened) {
    let links = opened.querySelectorAll('.sub-menu-link')
    Array.from(links).forEach(link => link.classList.remove('selected'))
    evt.target.classList.add('selected')
  }



});


export { toggleSubMenu }