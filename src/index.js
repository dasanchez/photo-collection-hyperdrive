function h(tag, attrs, ...children) {
  var el = document.createElement(tag)
  for (let k in attrs) {
    if (typeof attrs[k] === 'function') {
      el.addEventListener(k, attrs[k])
    } else {
      el.setAttribute(k, attrs[k])
    }
  }
  for (let child of children) el.append(child)
  return el
}

customElements.define('photo-album-app', class extends HTMLElement {
  constructor() {
    super()
    this.siteInfo = undefined
    this.albums = []
    this.photos = []
    this.selectedAlbum = ''
  }

  connectedCallback() {
    this.load()
  }

  async load() {
    this.siteInfo = await beaker.hyperdrive.getInfo()
    this.albums = await beaker.hyperdrive.readdir('/albums').catch(e => ([]))
    this.albums.sort().reverse();
    
    this.append(h('header', {},
      h('h1', {},
        this.siteInfo.title || "My Beaker Photo Collection",
        ' '
      ),
      (this.siteInfo.description)
        ? h('p', {}, this.siteInfo.description)
        : '',
    ))
    this.append(h('main', {}, 
      h('div', {class: 'albums'}, ''),
      h('div', {class: 'photos'}, '')
    ));
    this.renderAlbums()
  }

  renderAlbums() {
    var container = this.querySelector('.albums')
    container.innerHTML = ''
    for (let album of this.albums) {
      if (album === this.selectedAlbum) {
        container.append(
          h('div', { class: 'album selected', click: e => this.renderPhotos(album) }, 
          album)
          )
      }
      else {
        container.append(
          h('div', { class: 'album', click: e => this.renderPhotos(album) }, 
          album)
        )
      }
    }
    if (this.albums.length === 0) {
      container.append(h('div', { class: 'empty' }, 'This album has no photos'))
    }
  }

  async renderPhotos(album) {
    var container = this.querySelector('.photos')
    var albumPath = `/albums/${album}`
    container.innerHTML = ''

    this.photos = await beaker.hyperdrive.readdir(albumPath).catch(e => ([]))
    this.photos.sort();
    for (let photo of this.photos) {
      container.append(
        h('div', { class: 'photo', click: e => this.doViewModal(e, `${albumPath}/${photo}`) },
          h('img', { src: `${albumPath}/${photo}`, alt: photo })
        )
      )
    }
    if (this.photos.length === 0) {
      container.append(h('div', { class: 'empty' }, 'This album has no photos'))
    }
    this.selectedAlbum = album;
    this.renderAlbums();
  }

  async onEditInfo(e) {
    e.preventDefault()
    await beaker.shell.drivePropertiesDialog(location.toString())
    location.reload()
  }

  async doViewModal(e, photo) {
    e.stopPropagation()

    var existingDialog = this.querySelector('dialog')
    if (existingDialog) existingDialog.remove()

    var description = (await beaker.hyperdrive.stat(photo).catch(e => { }))?.metadata?.description

    var dialog = h('dialog', {},
      h('div', {},
        h('img', { src: photo }),
        h('div', {},
          h('div', { class: 'description' },
            description ? description : h('em', {}, 'No description'),
          ),
          this.siteInfo.writable
            ? h('div', { class: 'description' }, h('a', { href: '#', click: onShowEditDescription }, 'Edit'))
            : '',
          h('form', { class: 'edit-description' },
            h('textarea', {}, description || ''),
            h('div', { class: 'form-actions' },
              h('button', { class: 'noborder', click: onHideEditDescription }, 'Cancel'),
              h('button', { click: onSaveEditDescription }, 'Save')
            )
          )
        )
      )
    )

    function onShowEditDescription(e) {
      e.preventDefault()
      dialog.classList.add('editing-description')
      dialog.querySelector('.edit-description textarea').focus()
    }

    function onHideEditDescription(e) {
      e.preventDefault()
      dialog.classList.remove('editing-description')
    }

    async function onSaveEditDescription(e) {
      e.preventDefault()
      dialog.classList.remove('editing-description')

      description = dialog.querySelector('.edit-description textarea').value
      dialog.querySelector('.description').textContent = description
      await beaker.hyperdrive.updateMetadata(photo, { description })
    }

    async function onDelete(e) {
      if (!confirm('Delete this photo?')) {
        return
      }
      await beaker.hyperdrive.unlink(`/photos/${photo}`)
      location.reload()
    }

    this.append(dialog)
    dialog.showModal()
    document.activeElement.blur();
  }
})

document.body.addEventListener('click', e => {
  var existingDialog = document.querySelector('dialog')
  if (existingDialog && e.path[0] === existingDialog) {
    existingDialog.remove()
  }
})