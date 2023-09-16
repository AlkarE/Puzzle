let opened = null
window.addEventListener('click', (evt) =>{
  // close language picker when clicking outside it
  const el = evt.target
  if(!(el.classList.contains('dropdown') || 
  el.parentElement.classList.contains('dropdown')))  {
    let currentId = el.classList.contains('dropdown') ? el.parentElement.id : el.parentElement.parentElement.id 
    if(opened) {
      opened.classList.remove('is-open')
      opened = null
    }
  } else if(el.classList.contains('dropdown') || el.parentElement.classList.contains('dropdown')) {
    const activeMenu = el.classList.contains('dropdown') ? el.querySelector('.sub-menu') : el.parentElement.querySelector('.sub-menu')
    const isOpened = activeMenu.classList.contains('is-open') 
    
    if(!isOpened) {
      
      if(opened) {
        opened.classList.remove('is-open')
        opened = null
      } 
      activeMenu.classList.add('is-open')
      opened = activeMenu
    } else {
      activeMenu.classList.remove('is-open')
      opened = null
    }
  }
  // add selected class to clicked link
  if(el.classList.contains('sub-menu-link')) {
    const parent = el.closest('.sub-menu')
    let links = parent.querySelectorAll('.sub-menu-link')
    Array.from(links).forEach(link => link.classList.remove('selected'))
    el.classList.add('selected')
  }
});


export { opened }