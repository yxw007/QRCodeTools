;(window._iconfont_svg_string_ =
  '<svg><symbol id="icon-24gl-folderOpen" viewBox="0 0 1024 1024"><path d="M1003.153333 404.96a52.933333 52.933333 0 0 0-42.38-20.96H896V266.666667a53.393333 53.393333 0 0 0-53.333333-53.333334H461.253333a10.573333 10.573333 0 0 1-7.54-3.126666L344.46 100.953333A52.986667 52.986667 0 0 0 306.746667 85.333333H53.333333a53.393333 53.393333 0 0 0-53.333333 53.333334v704a53.393333 53.393333 0 0 0 53.333333 53.333333h796.893334a53.453333 53.453333 0 0 0 51.453333-39.333333l110.546667-405.333334a52.953333 52.953333 0 0 0-9.073334-46.373333zM53.333333 128h253.413334a10.573333 10.573333 0 0 1 7.54 3.126667l109.253333 109.253333A52.986667 52.986667 0 0 0 461.253333 256H842.666667a10.666667 10.666667 0 0 1 10.666666 10.666667v117.333333H173.773333a53.453333 53.453333 0 0 0-51.453333 39.333333L42.666667 715.366667V138.666667a10.666667 10.666667 0 0 1 10.666666-10.666667z m917.726667 312.14l-110.546667 405.333333a10.666667 10.666667 0 0 1-10.286666 7.86H63.226667a10.666667 10.666667 0 0 1-10.286667-13.473333l110.546667-405.333333A10.666667 10.666667 0 0 1 173.773333 426.666667h787a10.666667 10.666667 0 0 1 10.286667 13.473333z" fill="#5C5C66" ></path></symbol><symbol id="icon-jietu" viewBox="0 0 1024 1024"><path d="M981.3 821.3h-96V170.7c0-17.7-14.3-32-32-32H202.7v-96c0-17.7-14.3-32-32-32s-32 14.3-32 32v96h-96c-17.7 0-32 14.3-32 32s14.3 32 32 32h96v650.7c0 17.7 14.3 32 32 32h650.7v96c0 17.7 14.3 32 32 32s32-14.3 32-32v-96h96c17.7 0 32-14.3 32-32-0.1-17.7-14.4-32.1-32.1-32.1z m-778.6 0V202.7h618.7v618.7H202.7z"  ></path></symbol></svg>'),
  (function (n) {
    var t = (t = document.getElementsByTagName('script'))[t.length - 1],
      e = t.getAttribute('data-injectcss'),
      t = t.getAttribute('data-disable-injectsvg')
    if (!t) {
      var o,
        i,
        a,
        c,
        d,
        s = function (t, e) {
          e.parentNode.insertBefore(t, e)
        }
      if (e && !n.__iconfont__svg__cssinject__) {
        n.__iconfont__svg__cssinject__ = !0
        try {
          document.write(
            '<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>'
          )
        } catch (t) {
          console && console.log(t)
        }
      }
      ;(o = function () {
        var t,
          e = document.createElement('div')
        ;(e.innerHTML = n._iconfont_svg_string_),
          (e = e.getElementsByTagName('svg')[0]) &&
            (e.setAttribute('aria-hidden', 'true'),
            (e.style.position = 'absolute'),
            (e.style.width = 0),
            (e.style.height = 0),
            (e.style.overflow = 'hidden'),
            (e = e),
            (t = document.body).firstChild ? s(e, t.firstChild) : t.appendChild(e))
      }),
        document.addEventListener
          ? ~['complete', 'loaded', 'interactive'].indexOf(document.readyState)
            ? setTimeout(o, 0)
            : ((i = function () {
                document.removeEventListener('DOMContentLoaded', i, !1), o()
              }),
              document.addEventListener('DOMContentLoaded', i, !1))
          : document.attachEvent &&
            ((a = o),
            (c = n.document),
            (d = !1),
            r(),
            (c.onreadystatechange = function () {
              'complete' == c.readyState && ((c.onreadystatechange = null), l())
            }))
    }
    function l() {
      d || ((d = !0), a())
    }
    function r() {
      try {
        c.documentElement.doScroll('left')
      } catch (t) {
        return void setTimeout(r, 50)
      }
      l()
    }
  })(window)
