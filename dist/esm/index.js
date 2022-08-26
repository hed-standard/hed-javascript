var __getOwnPropNames = Object.getOwnPropertyNames
var __require = /* @__PURE__ */ ((x) =>
  typeof require !== 'undefined'
    ? require
    : typeof Proxy !== 'undefined'
    ? new Proxy(x, {
        get: (a, b) => (typeof require !== 'undefined' ? require : a)[b],
      })
    : x)(function (x) {
  if (typeof require !== 'undefined') return require.apply(this, arguments)
  throw new Error('Dynamic require of "' + x + '" is not supported')
})
var __esm = (fn, res) =>
  function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])((fn = 0))), res
  }
var __commonJS = (cb, mod) =>
  function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports
  }

// <define:process>
var define_process_default
var init_define_process = __esm({
  '<define:process>'() {
    define_process_default = { env: {}, argv: [], stdout: '', stderr: '', stdin: '', version: 'v12.14.1' }
  },
})

// converter/types.js
var require_types = __commonJS({
  'converter/types.js'(exports, module) {
    init_define_process()
    var TagEntry = class {
      constructor(shortTag, longTag) {
        this.shortTag = shortTag
        this.longTag = longTag
        this.longFormattedTag = longTag.toLowerCase()
      }
    }
    var Mapping = class {
      constructor(mappingData, hasNoDuplicates) {
        this.mappingData = mappingData
        this.hasNoDuplicates = hasNoDuplicates
      }
    }
    module.exports = {
      TagEntry,
      Mapping,
    }
  },
})

// utils/array.js
var require_array = __commonJS({
  'utils/array.js'(exports, module) {
    init_define_process()
    var getElementCount = function (array, elementToCount) {
      let count = 0
      for (let i = 0; i < array.length; i++) {
        if (array[i] === elementToCount) {
          count++
        }
      }
      return count
    }
    var asArray = function (array) {
      return Array.isArray(array) ? array : [array]
    }
    function recursiveMap(fn, array) {
      if (Array.isArray(array)) {
        return array.map((element) => recursiveMap(fn, element))
      } else {
        return fn(array)
      }
    }
    module.exports = {
      getElementCount,
      asArray,
      recursiveMap,
    }
  },
})

// node_modules/date-and-time/date-and-time.js
var require_date_and_time = __commonJS({
  'node_modules/date-and-time/date-and-time.js'(exports, module) {
    init_define_process()
    ;(function (global2) {
      'use strict'
      var date = {},
        locales = {},
        plugins = {},
        lang = 'en',
        _res = {
          MMMM: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ],
          MMM: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          dddd: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          ddd: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          dd: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
          A: ['AM', 'PM'],
        },
        _formatter = {
          YYYY: function (d) {
            return ('000' + d.getFullYear()).slice(-4)
          },
          YY: function (d) {
            return ('0' + d.getFullYear()).slice(-2)
          },
          Y: function (d) {
            return '' + d.getFullYear()
          },
          MMMM: function (d) {
            return this.res.MMMM[d.getMonth()]
          },
          MMM: function (d) {
            return this.res.MMM[d.getMonth()]
          },
          MM: function (d) {
            return ('0' + (d.getMonth() + 1)).slice(-2)
          },
          M: function (d) {
            return '' + (d.getMonth() + 1)
          },
          DD: function (d) {
            return ('0' + d.getDate()).slice(-2)
          },
          D: function (d) {
            return '' + d.getDate()
          },
          HH: function (d) {
            return ('0' + d.getHours()).slice(-2)
          },
          H: function (d) {
            return '' + d.getHours()
          },
          A: function (d) {
            return this.res.A[(d.getHours() > 11) | 0]
          },
          hh: function (d) {
            return ('0' + (d.getHours() % 12 || 12)).slice(-2)
          },
          h: function (d) {
            return '' + (d.getHours() % 12 || 12)
          },
          mm: function (d) {
            return ('0' + d.getMinutes()).slice(-2)
          },
          m: function (d) {
            return '' + d.getMinutes()
          },
          ss: function (d) {
            return ('0' + d.getSeconds()).slice(-2)
          },
          s: function (d) {
            return '' + d.getSeconds()
          },
          SSS: function (d) {
            return ('00' + d.getMilliseconds()).slice(-3)
          },
          SS: function (d) {
            return ('0' + ((d.getMilliseconds() / 10) | 0)).slice(-2)
          },
          S: function (d) {
            return '' + ((d.getMilliseconds() / 100) | 0)
          },
          dddd: function (d) {
            return this.res.dddd[d.getDay()]
          },
          ddd: function (d) {
            return this.res.ddd[d.getDay()]
          },
          dd: function (d) {
            return this.res.dd[d.getDay()]
          },
          Z: function (d) {
            return d.utc ? '+0000' : /[\+-]\d{4}/.exec(d.toTimeString())[0]
          },
          post: function (str) {
            return str
          },
        },
        _parser = {
          YYYY: function (str) {
            return this.exec(/^\d{4}/, str)
          },
          Y: function (str) {
            return this.exec(/^\d{1,4}/, str)
          },
          MMMM: function (str) {
            var result = this.find(this.res.MMMM, str)
            result.value++
            return result
          },
          MMM: function (str) {
            var result = this.find(this.res.MMM, str)
            result.value++
            return result
          },
          MM: function (str) {
            return this.exec(/^\d\d/, str)
          },
          M: function (str) {
            return this.exec(/^\d\d?/, str)
          },
          DD: function (str) {
            return this.exec(/^\d\d/, str)
          },
          D: function (str) {
            return this.exec(/^\d\d?/, str)
          },
          HH: function (str) {
            return this.exec(/^\d\d/, str)
          },
          H: function (str) {
            return this.exec(/^\d\d?/, str)
          },
          A: function (str) {
            return this.find(this.res.A, str)
          },
          hh: function (str) {
            return this.exec(/^\d\d/, str)
          },
          h: function (str) {
            return this.exec(/^\d\d?/, str)
          },
          mm: function (str) {
            return this.exec(/^\d\d/, str)
          },
          m: function (str) {
            return this.exec(/^\d\d?/, str)
          },
          ss: function (str) {
            return this.exec(/^\d\d/, str)
          },
          s: function (str) {
            return this.exec(/^\d\d?/, str)
          },
          SSS: function (str) {
            return this.exec(/^\d{1,3}/, str)
          },
          SS: function (str) {
            var result = this.exec(/^\d\d?/, str)
            result.value *= 10
            return result
          },
          S: function (str) {
            var result = this.exec(/^\d/, str)
            result.value *= 100
            return result
          },
          Z: function (str) {
            var result = this.exec(/^[\+-]\d{2}[0-5]\d/, str)
            result.value = ((result.value / 100) | 0) * -60 - (result.value % 100)
            return result
          },
          h12: function (h, a) {
            return (h === 12 ? 0 : h) + a * 12
          },
          exec: function (re, str) {
            var result = (re.exec(str) || [''])[0]
            return { value: result | 0, length: result.length }
          },
          find: function (array, str) {
            var index = -1,
              length = 0
            for (var i = 0, len = array.length, item; i < len; i++) {
              item = array[i]
              if (!str.indexOf(item) && item.length > length) {
                index = i
                length = item.length
              }
            }
            return { value: index, length }
          },
          pre: function (str) {
            return str
          },
        },
        customize = function (code, base, locale) {
          var extend = function (proto, props, res) {
              var Locale = function (r) {
                if (r) {
                  this.res = r
                }
              }
              Locale.prototype = proto
              Locale.prototype.constructor = Locale
              var newLocale = new Locale(res),
                value
              for (var key in props || {}) {
                value = props[key]
                newLocale[key] = value.slice ? value.slice() : value
              }
              return newLocale
            },
            loc = { res: extend(base.res, locale.res) }
          loc.formatter = extend(base.formatter, locale.formatter, loc.res)
          loc.parser = extend(base.parser, locale.parser, loc.res)
          locales[code] = loc
        }
      date.compile = function (formatString) {
        var re = /\[([^\[\]]|\[[^\[\]]*])*]|([A-Za-z])\2+|\.{3}|./g,
          keys,
          pattern = [formatString]
        while ((keys = re.exec(formatString))) {
          pattern[pattern.length] = keys[0]
        }
        return pattern
      }
      date.format = function (dateObj, arg, utc) {
        var pattern = typeof arg === 'string' ? date.compile(arg) : arg,
          d = date.addMinutes(dateObj, utc ? dateObj.getTimezoneOffset() : 0),
          formatter = locales[lang].formatter,
          str = ''
        d.utc = utc || false
        for (var i = 1, len = pattern.length, token; i < len; i++) {
          token = pattern[i]
          str += formatter[token] ? formatter.post(formatter[token](d, pattern[0])) : token.replace(/\[(.*)]/, '$1')
        }
        return str
      }
      date.preparse = function (dateString, arg) {
        var pattern = typeof arg === 'string' ? date.compile(arg) : arg,
          dt = { Y: 1970, M: 1, D: 1, H: 0, A: 0, h: 0, m: 0, s: 0, S: 0, Z: 0, _index: 0, _length: 0, _match: 0 },
          comment = /\[(.*)]/,
          parser = locales[lang].parser,
          offset = 0
        dateString = parser.pre(dateString)
        for (var i = 1, len = pattern.length, token, result; i < len; i++) {
          token = pattern[i]
          if (parser[token]) {
            result = parser[token](dateString.slice(offset), pattern[0])
            if (!result.length) {
              break
            }
            offset += result.length
            dt[token.charAt(0)] = result.value
            dt._match++
          } else if (token === dateString.charAt(offset) || token === ' ') {
            offset++
          } else if (comment.test(token) && !dateString.slice(offset).indexOf(comment.exec(token)[1])) {
            offset += token.length - 2
          } else if (token === '...') {
            offset = dateString.length
            break
          } else {
            break
          }
        }
        dt.H = dt.H || parser.h12(dt.h, dt.A)
        dt._index = offset
        dt._length = dateString.length
        return dt
      }
      date.isValid = function (arg1, arg2) {
        var dt = typeof arg1 === 'string' ? date.preparse(arg1, arg2) : arg1,
          last = [31, (28 + date.isLeapYear(dt.Y)) | 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][dt.M - 1]
        return !(
          dt._index < 1 ||
          dt._length < 1 ||
          dt._index - dt._length ||
          dt._match < 1 ||
          dt.Y < 1 ||
          dt.Y > 9999 ||
          dt.M < 1 ||
          dt.M > 12 ||
          dt.D < 1 ||
          dt.D > last ||
          dt.H < 0 ||
          dt.H > 23 ||
          dt.m < 0 ||
          dt.m > 59 ||
          dt.s < 0 ||
          dt.s > 59 ||
          dt.S < 0 ||
          dt.S > 999 ||
          dt.Z < -720 ||
          dt.Z > 840
        )
      }
      date.parse = function (dateString, arg, utc) {
        var dt = date.preparse(dateString, arg)
        if (date.isValid(dt)) {
          dt.M -= dt.Y < 100 ? 22801 : 1
          if (utc || dt.Z) {
            return new Date(Date.UTC(dt.Y, dt.M, dt.D, dt.H, dt.m + dt.Z, dt.s, dt.S))
          }
          return new Date(dt.Y, dt.M, dt.D, dt.H, dt.m, dt.s, dt.S)
        }
        return new Date(NaN)
      }
      date.transform = function (dateString, arg1, arg2, utc) {
        return date.format(date.parse(dateString, arg1), arg2, utc)
      }
      date.addYears = function (dateObj, years) {
        return date.addMonths(dateObj, years * 12)
      }
      date.addMonths = function (dateObj, months) {
        var d = new Date(dateObj.getTime())
        d.setMonth(d.getMonth() + months)
        return d
      }
      date.addDays = function (dateObj, days) {
        var d = new Date(dateObj.getTime())
        d.setDate(d.getDate() + days)
        return d
      }
      date.addHours = function (dateObj, hours) {
        return date.addMinutes(dateObj, hours * 60)
      }
      date.addMinutes = function (dateObj, minutes) {
        return date.addSeconds(dateObj, minutes * 60)
      }
      date.addSeconds = function (dateObj, seconds) {
        return date.addMilliseconds(dateObj, seconds * 1e3)
      }
      date.addMilliseconds = function (dateObj, milliseconds) {
        return new Date(dateObj.getTime() + milliseconds)
      }
      date.subtract = function (date1, date2) {
        var delta = date1.getTime() - date2.getTime()
        return {
          toMilliseconds: function () {
            return delta
          },
          toSeconds: function () {
            return delta / 1e3
          },
          toMinutes: function () {
            return delta / 6e4
          },
          toHours: function () {
            return delta / 36e5
          },
          toDays: function () {
            return delta / 864e5
          },
        }
      }
      date.isLeapYear = function (y) {
        return (!(y % 4) && !!(y % 100)) || !(y % 400)
      }
      date.isSameDay = function (date1, date2) {
        return date1.toDateString() === date2.toDateString()
      }
      date.locale = function (code, locale) {
        if (locale) {
          customize(code, { res: _res, formatter: _formatter, parser: _parser }, locale)
        } else if (typeof code === 'function') {
          lang = code(date)
        } else if (code) {
          if (global2 && !global2.date) {
            console.warn('This method of changing the locale is deprecated. See documentation for details.')
          }
          lang = code
        }
        return lang
      }
      date.extend = function (extension) {
        var extender = extension.extender || {}
        for (var key in extender) {
          if (!date[key]) {
            date[key] = extender[key]
          }
        }
        if (extension.formatter || extension.parser || extension.res) {
          customize(lang, locales[lang], extension)
        }
      }
      date.plugin = function (plugin, extension) {
        if (typeof plugin === 'function') {
          date.extend(plugins[plugin(date)])
        } else {
          plugins[plugin] = plugins[plugin] || extension
          if (!extension && plugins[plugin]) {
            date.extend(plugins[plugin])
            if (global2 && !global2.date) {
              console.warn('This method of applying plugins is deprecated. See documentation for details.')
            }
          }
        }
      }
      date.locale(lang, {})
      if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = date
      } else if (typeof define === 'function' && define.amd) {
        define([], function () {
          return date
        })
      } else {
        global2.date = date
      }
    })(exports)
  },
})

// node_modules/date-fns/_lib/toInteger/index.js
var require_toInteger = __commonJS({
  'node_modules/date-fns/_lib/toInteger/index.js'(exports, module) {
    'use strict'
    init_define_process()
    Object.defineProperty(exports, '__esModule', {
      value: true,
    })
    exports.default = toInteger
    function toInteger(dirtyNumber) {
      if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
        return NaN
      }
      var number = Number(dirtyNumber)
      if (isNaN(number)) {
        return number
      }
      return number < 0 ? Math.ceil(number) : Math.floor(number)
    }
    module.exports = exports.default
  },
})

// node_modules/date-fns/_lib/requiredArgs/index.js
var require_requiredArgs = __commonJS({
  'node_modules/date-fns/_lib/requiredArgs/index.js'(exports, module) {
    'use strict'
    init_define_process()
    Object.defineProperty(exports, '__esModule', {
      value: true,
    })
    exports.default = requiredArgs
    function requiredArgs(required, args) {
      if (args.length < required) {
        throw new TypeError(
          required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present',
        )
      }
    }
    module.exports = exports.default
  },
})

// node_modules/date-fns/parseISO/index.js
var require_parseISO = __commonJS({
  'node_modules/date-fns/parseISO/index.js'(exports, module) {
    'use strict'
    init_define_process()
    Object.defineProperty(exports, '__esModule', {
      value: true,
    })
    exports.default = parseISO
    var _index = _interopRequireDefault(require_toInteger())
    var _index2 = _interopRequireDefault(require_requiredArgs())
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj }
    }
    var MILLISECONDS_IN_HOUR = 36e5
    var MILLISECONDS_IN_MINUTE = 6e4
    var DEFAULT_ADDITIONAL_DIGITS = 2
    var patterns = {
      dateTimeDelimiter: /[T ]/,
      timeZoneDelimiter: /[Z ]/i,
      timezone: /([Z+-].*)$/,
    }
    var dateRegex = /^-?(?:(\d{3})|(\d{2})(?:-?(\d{2}))?|W(\d{2})(?:-?(\d{1}))?|)$/
    var timeRegex = /^(\d{2}(?:[.,]\d*)?)(?::?(\d{2}(?:[.,]\d*)?))?(?::?(\d{2}(?:[.,]\d*)?))?$/
    var timezoneRegex = /^([+-])(\d{2})(?::?(\d{2}))?$/
    function parseISO(argument, dirtyOptions) {
      ;(0, _index2.default)(1, arguments)
      var options = dirtyOptions || {}
      var additionalDigits =
        options.additionalDigits == null ? DEFAULT_ADDITIONAL_DIGITS : (0, _index.default)(options.additionalDigits)
      if (additionalDigits !== 2 && additionalDigits !== 1 && additionalDigits !== 0) {
        throw new RangeError('additionalDigits must be 0, 1 or 2')
      }
      if (!(typeof argument === 'string' || Object.prototype.toString.call(argument) === '[object String]')) {
        return new Date(NaN)
      }
      var dateStrings = splitDateString(argument)
      var date
      if (dateStrings.date) {
        var parseYearResult = parseYear(dateStrings.date, additionalDigits)
        date = parseDate(parseYearResult.restDateString, parseYearResult.year)
      }
      if (isNaN(date) || !date) {
        return new Date(NaN)
      }
      var timestamp = date.getTime()
      var time = 0
      var offset
      if (dateStrings.time) {
        time = parseTime(dateStrings.time)
        if (isNaN(time) || time === null) {
          return new Date(NaN)
        }
      }
      if (dateStrings.timezone) {
        offset = parseTimezone(dateStrings.timezone)
        if (isNaN(offset)) {
          return new Date(NaN)
        }
      } else {
        var dirtyDate = new Date(timestamp + time)
        var result = new Date(0)
        result.setFullYear(dirtyDate.getUTCFullYear(), dirtyDate.getUTCMonth(), dirtyDate.getUTCDate())
        result.setHours(
          dirtyDate.getUTCHours(),
          dirtyDate.getUTCMinutes(),
          dirtyDate.getUTCSeconds(),
          dirtyDate.getUTCMilliseconds(),
        )
        return result
      }
      return new Date(timestamp + time + offset)
    }
    function splitDateString(dateString) {
      var dateStrings = {}
      var array = dateString.split(patterns.dateTimeDelimiter)
      var timeString
      if (array.length > 2) {
        return dateStrings
      }
      if (/:/.test(array[0])) {
        dateStrings.date = null
        timeString = array[0]
      } else {
        dateStrings.date = array[0]
        timeString = array[1]
        if (patterns.timeZoneDelimiter.test(dateStrings.date)) {
          dateStrings.date = dateString.split(patterns.timeZoneDelimiter)[0]
          timeString = dateString.substr(dateStrings.date.length, dateString.length)
        }
      }
      if (timeString) {
        var token = patterns.timezone.exec(timeString)
        if (token) {
          dateStrings.time = timeString.replace(token[1], '')
          dateStrings.timezone = token[1]
        } else {
          dateStrings.time = timeString
        }
      }
      return dateStrings
    }
    function parseYear(dateString, additionalDigits) {
      var regex = new RegExp(
        '^(?:(\\d{4}|[+-]\\d{' + (4 + additionalDigits) + '})|(\\d{2}|[+-]\\d{' + (2 + additionalDigits) + '})$)',
      )
      var captures = dateString.match(regex)
      if (!captures)
        return {
          year: null,
        }
      var year = captures[1] && parseInt(captures[1])
      var century = captures[2] && parseInt(captures[2])
      return {
        year: century == null ? year : century * 100,
        restDateString: dateString.slice((captures[1] || captures[2]).length),
      }
    }
    function parseDate(dateString, year) {
      if (year === null) return null
      var captures = dateString.match(dateRegex)
      if (!captures) return null
      var isWeekDate = !!captures[4]
      var dayOfYear = parseDateUnit(captures[1])
      var month = parseDateUnit(captures[2]) - 1
      var day = parseDateUnit(captures[3])
      var week = parseDateUnit(captures[4])
      var dayOfWeek = parseDateUnit(captures[5]) - 1
      if (isWeekDate) {
        if (!validateWeekDate(year, week, dayOfWeek)) {
          return new Date(NaN)
        }
        return dayOfISOWeekYear(year, week, dayOfWeek)
      } else {
        var date = new Date(0)
        if (!validateDate(year, month, day) || !validateDayOfYearDate(year, dayOfYear)) {
          return new Date(NaN)
        }
        date.setUTCFullYear(year, month, Math.max(dayOfYear, day))
        return date
      }
    }
    function parseDateUnit(value) {
      return value ? parseInt(value) : 1
    }
    function parseTime(timeString) {
      var captures = timeString.match(timeRegex)
      if (!captures) return null
      var hours = parseTimeUnit(captures[1])
      var minutes = parseTimeUnit(captures[2])
      var seconds = parseTimeUnit(captures[3])
      if (!validateTime(hours, minutes, seconds)) {
        return NaN
      }
      return hours * MILLISECONDS_IN_HOUR + minutes * MILLISECONDS_IN_MINUTE + seconds * 1e3
    }
    function parseTimeUnit(value) {
      return (value && parseFloat(value.replace(',', '.'))) || 0
    }
    function parseTimezone(timezoneString) {
      if (timezoneString === 'Z') return 0
      var captures = timezoneString.match(timezoneRegex)
      if (!captures) return 0
      var sign = captures[1] === '+' ? -1 : 1
      var hours = parseInt(captures[2])
      var minutes = (captures[3] && parseInt(captures[3])) || 0
      if (!validateTimezone(hours, minutes)) {
        return NaN
      }
      return sign * (hours * MILLISECONDS_IN_HOUR + minutes * MILLISECONDS_IN_MINUTE)
    }
    function dayOfISOWeekYear(isoWeekYear, week, day) {
      var date = new Date(0)
      date.setUTCFullYear(isoWeekYear, 0, 4)
      var fourthOfJanuaryDay = date.getUTCDay() || 7
      var diff = (week - 1) * 7 + day + 1 - fourthOfJanuaryDay
      date.setUTCDate(date.getUTCDate() + diff)
      return date
    }
    var daysInMonths = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    function isLeapYearIndex(year) {
      return year % 400 === 0 || (year % 4 === 0 && year % 100)
    }
    function validateDate(year, month, date) {
      return (
        month >= 0 && month <= 11 && date >= 1 && date <= (daysInMonths[month] || (isLeapYearIndex(year) ? 29 : 28))
      )
    }
    function validateDayOfYearDate(year, dayOfYear) {
      return dayOfYear >= 1 && dayOfYear <= (isLeapYearIndex(year) ? 366 : 365)
    }
    function validateWeekDate(_year, week, day) {
      return week >= 1 && week <= 53 && day >= 0 && day <= 6
    }
    function validateTime(hours, minutes, seconds) {
      if (hours === 24) {
        return minutes === 0 && seconds === 0
      }
      return seconds >= 0 && seconds < 60 && minutes >= 0 && minutes < 60 && hours >= 0 && hours < 25
    }
    function validateTimezone(_hours, minutes) {
      return minutes >= 0 && minutes <= 59
    }
    module.exports = exports.default
  },
})

// node_modules/date-fns/toDate/index.js
var require_toDate = __commonJS({
  'node_modules/date-fns/toDate/index.js'(exports, module) {
    'use strict'
    init_define_process()
    Object.defineProperty(exports, '__esModule', {
      value: true,
    })
    exports.default = toDate
    var _index = _interopRequireDefault(require_requiredArgs())
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj }
    }
    function toDate(argument) {
      ;(0, _index.default)(1, arguments)
      var argStr = Object.prototype.toString.call(argument)
      if (argument instanceof Date || (typeof argument === 'object' && argStr === '[object Date]')) {
        return new Date(argument.getTime())
      } else if (typeof argument === 'number' || argStr === '[object Number]') {
        return new Date(argument)
      } else {
        if ((typeof argument === 'string' || argStr === '[object String]') && typeof console !== 'undefined') {
          console.warn(
            "Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule",
          )
          console.warn(new Error().stack)
        }
        return new Date(NaN)
      }
    }
    module.exports = exports.default
  },
})

// node_modules/date-fns/isValid/index.js
var require_isValid = __commonJS({
  'node_modules/date-fns/isValid/index.js'(exports, module) {
    'use strict'
    init_define_process()
    Object.defineProperty(exports, '__esModule', {
      value: true,
    })
    exports.default = isValid
    var _index = _interopRequireDefault(require_toDate())
    var _index2 = _interopRequireDefault(require_requiredArgs())
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj }
    }
    function isValid(dirtyDate) {
      ;(0, _index2.default)(1, arguments)
      var date = (0, _index.default)(dirtyDate)
      return !isNaN(date)
    }
    module.exports = exports.default
  },
})

// utils/string.js
var require_string = __commonJS({
  'utils/string.js'(exports, module) {
    init_define_process()
    var date = require_date_and_time()
    var parseISO = require_parseISO()
    var dateIsValid = require_isValid()
    var rfc3339ish = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?$/
    var digitExpression = /^-?\d+(?:\.\d+)?(?:[Ee]-?\d+)?$/
    var stringIsEmpty = function (string) {
      return !string.trim()
    }
    var getCharacterCount = function (string, characterToCount) {
      return string.split(characterToCount).length - 1
    }
    var capitalizeString = function (string) {
      return string.charAt(0).toUpperCase() + string.substring(1)
    }
    var isClockFaceTime = function (timeString) {
      return date.isValid(timeString, 'HH:mm') || date.isValid(timeString, 'HH:mm:ss')
    }
    var isDateTime = function (dateTimeString) {
      return dateIsValid(parseISO(dateTimeString)) && rfc3339ish.test(dateTimeString)
    }
    var isNumber = function (numericString) {
      return digitExpression.test(numericString)
    }
    var stringTemplate = function (strings, ...keys) {
      return function (...values) {
        const dict = values[values.length - 1] || {}
        const result = [strings[0]]
        keys.forEach((key, i) => {
          const value = Number.isInteger(key) ? values[key] : dict[key]
          result.push(value, strings[i + 1])
        })
        return result.join('')
      }
    }
    module.exports = {
      stringIsEmpty,
      getCharacterCount,
      capitalizeString,
      isClockFaceTime,
      isDateTime,
      isNumber,
      stringTemplate,
    }
  },
})

// common/issues/data.js
var require_data = __commonJS({
  'common/issues/data.js'(exports, module) {
    init_define_process()
    var { stringTemplate } = require_string()
    var issueData = {
      parentheses: {
        hedCode: 'HED_PARENTHESES_MISMATCH',
        level: 'error',
        message: stringTemplate`Number of opening and closing parentheses are unequal. ${'opening'} opening parentheses. ${'closing'} closing parentheses.`,
      },
      unopenedParentheses: {
        hedCode: 'HED_PARENTHESES_MISMATCH',
        level: 'error',
        message: stringTemplate`Closing parenthesis at index ${'index'} of string "${'string'}" does not have a corresponding opening parenthesis.`,
      },
      unclosedParentheses: {
        hedCode: 'HED_PARENTHESES_MISMATCH',
        level: 'error',
        message: stringTemplate`Opening parenthesis at index ${'index'} of string "${'string'}" does not have a corresponding closing parenthesis.`,
      },
      extraDelimiter: {
        hedCode: 'HED_TAG_EMPTY',
        level: 'error',
        message: stringTemplate`Extra delimiter "${'character'}" at index ${'index'} of string "${'string'}"`,
      },
      commaMissing: {
        hedCode: 'HED_COMMA MISSING',
        level: 'error',
        message: stringTemplate`Comma missing after - "${'tag'}"`,
      },
      duplicateTag: {
        hedCode: 'HED_TAG_REPEATED',
        level: 'error',
        message: stringTemplate`Duplicate tag at indices (${0}, ${1}) - "${'tag'}"`,
      },
      invalidCharacter: {
        hedCode: 'HED_CHARACTER_INVALID',
        level: 'error',
        message: stringTemplate`Invalid character "${'character'}" at index ${'index'} of string "${'string'}"`,
      },
      invalidTag: {
        hedCode: 'HED_TAG_INVALID',
        level: 'error',
        message: stringTemplate`Invalid tag - "${'tag'}"`,
      },
      extraCommaOrInvalid: {
        hedCode: 'HED_TAG_INVALID',
        level: 'error',
        message: stringTemplate`Either "${'previousTag'}" contains a comma when it should not or "${'tag'}" is not a valid tag`,
      },
      multipleUniqueTags: {
        hedCode: 'HED_TAG_NOT_UNIQUE',
        level: 'error',
        message: stringTemplate`Multiple unique tags with prefix - "${'tag'}"`,
      },
      childRequired: {
        hedCode: 'HED_TAG_REQUIRES_CHILD',
        level: 'error',
        message: stringTemplate`Descendant tag required - "${'tag'}"`,
      },
      requiredPrefixMissing: {
        hedCode: 'HED_REQUIRED_TAG_MISSING',
        level: 'warning',
        message: stringTemplate`Tag with prefix "${'tagPrefix'}" is required`,
      },
      unitClassDefaultUsed: {
        hedCode: 'HED_UNITS_MISSING',
        level: 'warning',
        message: stringTemplate`No unit specified. Using "${'defaultUnit'}" as the default - "${'tag'}"`,
      },
      unitClassInvalidUnit: {
        hedCode: 'HED_UNITS_INVALID',
        level: 'error',
        message: stringTemplate`Invalid unit - "${'tag'}" - valid units are "${'unitClassUnits'}"`,
      },
      invalidValue: {
        hedCode: 'HED_VALUE_INVALID',
        level: 'error',
        message: stringTemplate`Invalid placeholder value for tag "${'tag'}"`,
      },
      invalidPlaceholder: {
        hedCode: 'HED_PLACEHOLDER_INVALID',
        level: 'error',
        message: stringTemplate`Invalid placeholder - "${'tag'}"`,
      },
      missingPlaceholder: {
        hedCode: 'HED_PLACEHOLDER_INVALID',
        level: 'error',
        message: stringTemplate`HED value string "${'string'}" is missing a required placeholder.`,
      },
      extension: {
        hedCode: 'HED_TAG_EXTENDED',
        level: 'warning',
        message: stringTemplate`Tag extension found - "${'tag'}"`,
      },
      invalidPlaceholderInDefinition: {
        hedCode: 'HED_PLACEHOLDER_INVALID',
        level: 'error',
        message: stringTemplate`Invalid placeholder in definition - "${'definition'}"`,
      },
      nestedDefinition: {
        hedCode: 'HED_DEFINITION_INVALID',
        level: 'error',
        message: stringTemplate`Illegal nested definition in tag group for definition "${'definition'}"`,
      },
      duplicateDefinition: {
        hedCode: 'HED_DEFINITION_INVALID',
        level: 'error',
        message: stringTemplate`Definition "${'definition'}" is declared multiple times. This instance's tag group is "${'tagGroup'}"`,
      },
      multipleTagGroupsInDefinition: {
        hedCode: 'HED_DEFINITION_INVALID',
        level: 'error',
        message: stringTemplate`Multiple inner tag groups found in definition "${'definition'}"`,
      },
      illegalDefinitionGroupTag: {
        hedCode: 'HED_DEFINITION_INVALID',
        level: 'error',
        message: stringTemplate`Illegal tag "${'tag'}" in tag group for definition "${'definition'}"`,
      },
      invalidTopLevelTagGroupTag: {
        hedCode: 'HED_TAG_GROUP_ERROR',
        level: 'error',
        message: stringTemplate`Tag "${'tag'}" is only allowed inside of a top-level tag group.`,
      },
      multipleTopLevelTagGroupTags: {
        hedCode: 'HED_TAG_GROUP_ERROR',
        level: 'error',
        message: stringTemplate`Tag "${'tag'}" found in top-level tag group where "${'otherTag'}" was already defined.`,
      },
      invalidTopLevelTag: {
        hedCode: 'HED_TAG_GROUP_ERROR',
        level: 'error',
        message: stringTemplate`Tag "${'tag'}" is only allowed inside of a tag group.`,
      },
      invalidParentNode: {
        hedCode: 'HED_VALUE_IS_NODE',
        level: 'error',
        message: stringTemplate`"${'tag'}" appears as "${'parentTag'}" and cannot be used as an extension. Indices (${0}, ${1}).`,
      },
      emptyTagFound: {
        hedCode: 'HED_NODE_NAME_EMPTY',
        level: 'error',
        message: stringTemplate`Empty tag cannot be converted.`,
      },
      duplicateTagsInSchema: {
        hedCode: 'HED_GENERIC_ERROR',
        level: 'error',
        message: stringTemplate`Source HED schema is invalid as it contains duplicate tags.`,
      },
      invalidSchemaNickname: {
        hedCode: 'HED_SCHEMA_LOAD_FAILED',
        level: 'error',
        message: stringTemplate`The prefix nickname "${'nickname'}" in specification "${'spec'}" is duplicated or invalid.`,
      },
      invalidSchemaSpecification: {
        hedCode: 'HED_SCHEMA_LOAD_FAILED',
        level: 'error',
        message: stringTemplate`The supplied schema specification is invalid. Specification: ${'spec'}`,
      },
      requestedSchemaLoadFailedFallbackUsed: {
        hedCode: 'HED_SCHEMA_LOAD_FAILED',
        level: 'warning',
        message: stringTemplate`The requested schema failed to load. The fallback schema bundled with this validator will be used instead. Specification: ${'spec'}`,
      },
      requestedSchemaLoadFailedNoFallbackUsed: {
        hedCode: 'HED_SCHEMA_LOAD_FAILED',
        level: 'error',
        message: stringTemplate`The requested schema failed to load. The validator did not attempt to load a fallback schema. Specification: ${'spec'}`,
      },
      fallbackSchemaLoadFailed: {
        hedCode: 'HED_SCHEMA_LOAD_FAILED',
        level: 'error',
        message: stringTemplate`The fallback schema bundled with this validator failed to load. No HED validation was performed.`,
      },
      localSchemaLoadFailed: {
        hedCode: 'HED_SCHEMA_LOAD_FAILED',
        level: 'error',
        message: stringTemplate`Could not load HED schema from path "${'path'}" - "${'error'}".`,
      },
      remoteSchemaLoadFailed: {
        hedCode: 'HED_SCHEMA_LOAD_FAILED',
        level: 'error',
        message: stringTemplate`Could not load HED schema "${'spec'}" from remote repository - "${'error'}".`,
      },
      unmatchedBaseSchema: {
        hedCode: 'HED_LIBRARY_UNMATCHED',
        level: 'error',
        message: stringTemplate`Tag "${'tag'}" is declared to use a base schema in the dataset's schema listing, but no such schema was defined.`,
      },
      unmatchedLibrarySchema: {
        hedCode: 'HED_LIBRARY_UNMATCHED',
        level: 'error',
        message: stringTemplate`Tag "${'tag'}" is declared to use a library schema nicknamed "${'library'}" in the dataset's schema listing, but no such schema was found.`,
      },
      genericError: {
        hedCode: 'HED_GENERIC_ERROR',
        level: 'error',
        message: stringTemplate`Unknown HED error "${'internalCode'}" - parameters: "${'parameters'}".`,
      },
    }
    module.exports = issueData
  },
})

// common/issues/issues.js
var require_issues = __commonJS({
  'common/issues/issues.js'(exports, module) {
    init_define_process()
    var issueData = require_data()
    var Issue = class {
      constructor(internalCode, hedCode, level, message) {
        this.internalCode = internalCode
        this.code = internalCode
        this.hedCode = hedCode
        this.level = level
        this.message = `${level.toUpperCase()}: [${hedCode}] ${message}`
      }
    }
    var generateIssue = function (internalCode, parameters) {
      const issueCodeData = issueData[internalCode] || issueData.genericError
      const { hedCode, level, message } = issueCodeData
      const bounds = parameters.bounds || []
      if (issueCodeData === issueData.genericError) {
        parameters.internalCode = internalCode
        parameters.parameters = 'Issue parameters: ' + JSON.stringify(parameters)
      }
      const parsedMessage = message(...bounds, parameters)
      return new Issue(internalCode, hedCode, level, parsedMessage)
    }
    module.exports = {
      generateIssue,
      Issue,
    }
  },
})

// converter/issues.js
var require_issues2 = __commonJS({
  'converter/issues.js'(exports, module) {
    init_define_process()
    var issuesUtil = require_issues()
    var generateIssue = function (code, hedString, parameters = {}, bounds = []) {
      parameters.tag = hedString.slice(bounds[0], bounds[1])
      parameters.bounds = bounds
      const issue = issuesUtil.generateIssue(code, parameters)
      issue.sourceString = hedString
      return issue
    }
    module.exports = generateIssue
  },
})

// converter/splitHedString.js
var require_splitHedString = __commonJS({
  'converter/splitHedString.js'(exports, module) {
    init_define_process()
    var tagDelimiters = [',', '(', ')', '~']
    var splitHedString = function (hedString) {
      const resultPositions = []
      let currentSpacing = 0
      let insideDelimiter = true
      let startPosition = -1
      let lastEndPosition = 0
      for (let i = 0; i < hedString.length; i++) {
        const character = hedString.charAt(i)
        if (character === ' ') {
          currentSpacing++
          continue
        }
        if (tagDelimiters.includes(character)) {
          if (!insideDelimiter) {
            insideDelimiter = true
            if (startPosition >= 0) {
              lastEndPosition = i - currentSpacing
              resultPositions.push([true, [startPosition, lastEndPosition]])
              currentSpacing = 0
              startPosition = -1
            }
          }
          continue
        }
        if (insideDelimiter && lastEndPosition >= 0) {
          if (lastEndPosition !== i) {
            resultPositions.push([false, [lastEndPosition, i]])
          }
          lastEndPosition = -1
        }
        currentSpacing = 0
        insideDelimiter = false
        if (startPosition < 0) {
          startPosition = i
        }
      }
      if (lastEndPosition >= 0 && hedString.length !== lastEndPosition) {
        resultPositions.push([false, [lastEndPosition, hedString.length]])
      }
      if (startPosition >= 0) {
        resultPositions.push([true, [startPosition, hedString.length - currentSpacing]])
        if (currentSpacing > 0) {
          resultPositions.push([false, [hedString.length - currentSpacing, hedString.length]])
        }
      }
      return resultPositions
    }
    module.exports = splitHedString
  },
})

// converter/converter.js
var require_converter = __commonJS({
  'converter/converter.js'(exports, module) {
    init_define_process()
    var types = require_types()
    var TagEntry = types.TagEntry
    var { asArray } = require_array()
    var generateIssue = require_issues2()
    var splitHedString = require_splitHedString()
    var doubleSlashPattern = /[\s/]*\/+[\s/]*/g
    var removeSlashesAndSpaces = function (hedString) {
      return hedString.replace(doubleSlashPattern, '/')
    }
    var convertTagToLong = function (schema, hedTag, hedString, offset) {
      const mapping = schema.mapping
      if (hedTag.startsWith('/')) {
        hedTag = hedTag.slice(1)
      }
      if (hedTag.endsWith('/')) {
        hedTag = hedTag.slice(0, -1)
      }
      const cleanedTag = hedTag.toLowerCase()
      const splitTag = cleanedTag.split('/')
      let foundTagEntry = null
      let takesValueTag = false
      let endingIndex = 0
      let foundUnknownExtension = false
      let foundEndingIndex = 0
      const generateParentNodeIssue = (tagEntries, startingIndex, endingIndex2) => {
        return [
          hedTag,
          [
            generateIssue(
              'invalidParentNode',
              hedString,
              {
                parentTag: Array.isArray(tagEntries)
                  ? tagEntries.map((tagEntry) => {
                      return tagEntry.longTag
                    })
                  : tagEntries.longTag,
              },
              [startingIndex + offset, endingIndex2 + offset],
            ),
          ],
        ]
      }
      for (const tag of splitTag) {
        if (endingIndex !== 0) {
          endingIndex++
        }
        const startingIndex = endingIndex
        endingIndex += tag.length
        const tagEntries = asArray(mapping.mappingData.get(tag))
        if (foundUnknownExtension) {
          if (mapping.mappingData.has(tag)) {
            return generateParentNodeIssue(tagEntries, startingIndex, endingIndex)
          } else {
            continue
          }
        }
        if (!mapping.mappingData.has(tag)) {
          if (foundTagEntry === null) {
            return [
              hedTag,
              [generateIssue('invalidTag', hedString, {}, [startingIndex + offset, endingIndex + offset])],
            ]
          }
          foundUnknownExtension = true
          continue
        }
        let tagFound = false
        for (const tagEntry of tagEntries) {
          const tagString = tagEntry.longFormattedTag
          const mainHedPortion = cleanedTag.slice(0, endingIndex)
          if (tagString.endsWith(mainHedPortion)) {
            tagFound = true
            foundEndingIndex = endingIndex
            foundTagEntry = tagEntry
            if (tagEntry.takesValue) {
              takesValueTag = true
            }
            break
          }
        }
        if (!tagFound && !takesValueTag) {
          return generateParentNodeIssue(tagEntries, startingIndex, endingIndex)
        }
      }
      const remainder = hedTag.slice(foundEndingIndex)
      const longTagString = foundTagEntry.longTag + remainder
      return [longTagString, []]
    }
    var convertTagToShort = function (schema, hedTag, hedString, offset) {
      const mapping = schema.mapping
      if (hedTag.startsWith('/')) {
        hedTag = hedTag.slice(1)
      }
      if (hedTag.endsWith('/')) {
        hedTag = hedTag.slice(0, -1)
      }
      const cleanedTag = hedTag.toLowerCase()
      const splitTag = cleanedTag.split('/')
      splitTag.reverse()
      let foundTagEntry = null
      let index = hedTag.length
      let lastFoundIndex = index
      for (const tag of splitTag) {
        if (mapping.mappingData.has(tag)) {
          foundTagEntry = mapping.mappingData.get(tag)
          lastFoundIndex = index
          index -= tag.length
          break
        }
        lastFoundIndex = index
        index -= tag.length
        if (index !== 0) {
          index--
        }
      }
      if (foundTagEntry === null) {
        return [hedTag, [generateIssue('invalidTag', hedString, {}, [index + offset, lastFoundIndex + offset])]]
      }
      const mainHedPortion = cleanedTag.slice(0, lastFoundIndex)
      const tagString = foundTagEntry.longFormattedTag
      if (!tagString.endsWith(mainHedPortion)) {
        return [
          hedTag,
          [
            generateIssue('invalidParentNode', hedString, { parentTag: foundTagEntry.longTag }, [
              index + offset,
              lastFoundIndex + offset,
            ]),
          ],
        ]
      }
      const remainder = hedTag.slice(lastFoundIndex)
      const shortTagString = foundTagEntry.shortTag + remainder
      return [shortTagString, []]
    }
    var convertPartialHedStringToLong = function (schema, partialHedString, fullHedString, offset) {
      let issues = []
      const hedString = removeSlashesAndSpaces(partialHedString)
      if (hedString === '') {
        issues.push(generateIssue('emptyTagFound', ''))
        return [hedString, issues]
      }
      const hedTags = splitHedString(hedString)
      let finalString = ''
      for (const [isHedTag, [startPosition, endPosition]] of hedTags) {
        const tag = hedString.slice(startPosition, endPosition)
        if (isHedTag) {
          const [shortTagString, singleError] = convertTagToLong(schema, tag, fullHedString, startPosition + offset)
          issues = issues.concat(singleError)
          finalString += shortTagString
        } else {
          finalString += tag
        }
      }
      return [finalString, issues]
    }
    var convertHedString = function (schema, hedString, conversionFn) {
      let issues = []
      if (!schema.mapping.hasNoDuplicates) {
        issues.push(generateIssue('duplicateTagsInSchema', ''))
        return [hedString, issues]
      }
      hedString = removeSlashesAndSpaces(hedString)
      if (hedString === '') {
        issues.push(generateIssue('emptyTagFound', ''))
        return [hedString, issues]
      }
      const hedTags = splitHedString(hedString)
      let finalString = ''
      for (const [isHedTag, [startPosition, endPosition]] of hedTags) {
        const tag = hedString.slice(startPosition, endPosition)
        if (isHedTag) {
          const [shortTagString, singleError] = conversionFn(schema, tag, hedString, startPosition)
          issues = issues.concat(singleError)
          finalString += shortTagString
        } else {
          finalString += tag
        }
      }
      return [finalString, issues]
    }
    var convertHedStringToLong = function (schemas, hedString) {
      return convertHedString(schemas.baseSchema, hedString, convertTagToLong)
    }
    var convertHedStringToShort = function (schemas, hedString) {
      return convertHedString(schemas.baseSchema, hedString, convertTagToShort)
    }
    module.exports = {
      convertHedStringToShort,
      convertHedStringToLong,
      convertPartialHedStringToLong,
      convertTagToShort,
      convertTagToLong,
      removeSlashesAndSpaces,
    }
  },
})

// utils/xpath.js
var require_xpath = __commonJS({
  'utils/xpath.js'(exports, module) {
    init_define_process()
    var childToParent = {
      unitClass: 'unitClasses',
      unitModifier: 'unitModifiers',
      unitClassDefinition: 'unitClassDefinitions',
      unitModifierDefinition: 'unitModifierDefinitions',
      valueClassDefinition: 'valueClassDefinitions',
      schemaAttributeDefinition: 'schemaAttributeDefinitions',
      propertyDefinition: 'propertyDefinitions',
    }
    var find = function (element, query) {
      const { elementName, attributeName } = parseXPath(query)
      const searchMap = (child) => {
        return search(child, elementName, attributeName)
      }
      if (elementName in childToParent && childToParent[elementName] in element) {
        return element[childToParent[elementName]][0][elementName]
      } else if (elementName === 'node') {
        const parentElement = element.schema ? element.schema[0] : element
        const nodeList = parentElement.node || []
        return nodeList.flatMap(searchMap)
      }
      return []
    }
    var parseXPath = function (query) {
      const nodeQuery = /^\/\/(\w+)$/
      const attributeQuery = /^\/\/(\w+)\[@(\w+)]$/
      let elementName, attributeName
      const attributeMatch = query.match(attributeQuery)
      if (attributeMatch) {
        ;[, elementName, attributeName] = attributeMatch
      } else {
        const nodeMatch = query.match(nodeQuery)
        if (nodeMatch) {
          ;[, elementName] = nodeMatch
        } else {
          return {}
        }
      }
      return { elementName, attributeName }
    }
    var search = function (element, elementName, attributeName) {
      let result = []
      if (attributeName === void 0 || ('$' in element && attributeName in element.$)) {
        result.push(element)
      }
      if (elementName in element) {
        result = result.concat(
          element[elementName].flatMap((element2) => {
            return search(element2, elementName, attributeName)
          }),
        )
      }
      return result
    }
    module.exports = {
      find,
    }
  },
})

// common/schema/config.js
var require_config = __commonJS({
  'common/schema/config.js'(exports, module) {
    init_define_process()
    var fallbackFilePath = 'data/HED8.0.0.xml'
    var fallbackDirectory = 'data'
    var localSchemaList = /* @__PURE__ */ new Set(['HED8.0.0', 'HED_testlib_1.0.2'])
    module.exports = {
      fallbackFilePath,
      fallbackDirectory,
      localSchemaList,
    }
  },
})

// node_modules/xml2js/lib/defaults.js
var require_defaults = __commonJS({
  'node_modules/xml2js/lib/defaults.js'(exports) {
    init_define_process()
    ;(function () {
      exports.defaults = {
        0.1: {
          explicitCharkey: false,
          trim: true,
          normalize: true,
          normalizeTags: false,
          attrkey: '@',
          charkey: '#',
          explicitArray: false,
          ignoreAttrs: false,
          mergeAttrs: false,
          explicitRoot: false,
          validator: null,
          xmlns: false,
          explicitChildren: false,
          childkey: '@@',
          charsAsChildren: false,
          includeWhiteChars: false,
          async: false,
          strict: true,
          attrNameProcessors: null,
          attrValueProcessors: null,
          tagNameProcessors: null,
          valueProcessors: null,
          emptyTag: '',
        },
        0.2: {
          explicitCharkey: false,
          trim: false,
          normalize: false,
          normalizeTags: false,
          attrkey: '$',
          charkey: '_',
          explicitArray: true,
          ignoreAttrs: false,
          mergeAttrs: false,
          explicitRoot: true,
          validator: null,
          xmlns: false,
          explicitChildren: false,
          preserveChildrenOrder: false,
          childkey: '$$',
          charsAsChildren: false,
          includeWhiteChars: false,
          async: false,
          strict: true,
          attrNameProcessors: null,
          attrValueProcessors: null,
          tagNameProcessors: null,
          valueProcessors: null,
          rootName: 'root',
          xmldec: {
            version: '1.0',
            encoding: 'UTF-8',
            standalone: true,
          },
          doctype: null,
          renderOpts: {
            pretty: true,
            indent: '  ',
            newline: '\n',
          },
          headless: false,
          chunkSize: 1e4,
          emptyTag: '',
          cdata: false,
        },
      }
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/Utility.js
var require_Utility = __commonJS({
  'node_modules/xmlbuilder/lib/Utility.js'(exports, module) {
    init_define_process()
    ;(function () {
      var assign,
        getValue,
        isArray,
        isEmpty,
        isFunction,
        isObject,
        isPlainObject,
        slice = [].slice,
        hasProp = {}.hasOwnProperty
      assign = function () {
        var i, key, len, source, sources, target
        ;(target = arguments[0]), (sources = 2 <= arguments.length ? slice.call(arguments, 1) : [])
        if (isFunction(Object.assign)) {
          Object.assign.apply(null, arguments)
        } else {
          for (i = 0, len = sources.length; i < len; i++) {
            source = sources[i]
            if (source != null) {
              for (key in source) {
                if (!hasProp.call(source, key)) continue
                target[key] = source[key]
              }
            }
          }
        }
        return target
      }
      isFunction = function (val) {
        return !!val && Object.prototype.toString.call(val) === '[object Function]'
      }
      isObject = function (val) {
        var ref
        return !!val && ((ref = typeof val) === 'function' || ref === 'object')
      }
      isArray = function (val) {
        if (isFunction(Array.isArray)) {
          return Array.isArray(val)
        } else {
          return Object.prototype.toString.call(val) === '[object Array]'
        }
      }
      isEmpty = function (val) {
        var key
        if (isArray(val)) {
          return !val.length
        } else {
          for (key in val) {
            if (!hasProp.call(val, key)) continue
            return false
          }
          return true
        }
      }
      isPlainObject = function (val) {
        var ctor, proto
        return (
          isObject(val) &&
          (proto = Object.getPrototypeOf(val)) &&
          (ctor = proto.constructor) &&
          typeof ctor === 'function' &&
          ctor instanceof ctor &&
          Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object)
        )
      }
      getValue = function (obj) {
        if (isFunction(obj.valueOf)) {
          return obj.valueOf()
        } else {
          return obj
        }
      }
      module.exports.assign = assign
      module.exports.isFunction = isFunction
      module.exports.isObject = isObject
      module.exports.isArray = isArray
      module.exports.isEmpty = isEmpty
      module.exports.isPlainObject = isPlainObject
      module.exports.getValue = getValue
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDOMImplementation.js
var require_XMLDOMImplementation = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDOMImplementation.js'(exports, module) {
    init_define_process()
    ;(function () {
      var XMLDOMImplementation
      module.exports = XMLDOMImplementation = (function () {
        function XMLDOMImplementation2() {}
        XMLDOMImplementation2.prototype.hasFeature = function (feature, version) {
          return true
        }
        XMLDOMImplementation2.prototype.createDocumentType = function (qualifiedName, publicId, systemId) {
          throw new Error('This DOM method is not implemented.')
        }
        XMLDOMImplementation2.prototype.createDocument = function (namespaceURI, qualifiedName, doctype) {
          throw new Error('This DOM method is not implemented.')
        }
        XMLDOMImplementation2.prototype.createHTMLDocument = function (title) {
          throw new Error('This DOM method is not implemented.')
        }
        XMLDOMImplementation2.prototype.getFeature = function (feature, version) {
          throw new Error('This DOM method is not implemented.')
        }
        return XMLDOMImplementation2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDOMErrorHandler.js
var require_XMLDOMErrorHandler = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDOMErrorHandler.js'(exports, module) {
    init_define_process()
    ;(function () {
      var XMLDOMErrorHandler
      module.exports = XMLDOMErrorHandler = (function () {
        function XMLDOMErrorHandler2() {}
        XMLDOMErrorHandler2.prototype.handleError = function (error) {
          throw new Error(error)
        }
        return XMLDOMErrorHandler2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDOMStringList.js
var require_XMLDOMStringList = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDOMStringList.js'(exports, module) {
    init_define_process()
    ;(function () {
      var XMLDOMStringList
      module.exports = XMLDOMStringList = (function () {
        function XMLDOMStringList2(arr) {
          this.arr = arr || []
        }
        Object.defineProperty(XMLDOMStringList2.prototype, 'length', {
          get: function () {
            return this.arr.length
          },
        })
        XMLDOMStringList2.prototype.item = function (index) {
          return this.arr[index] || null
        }
        XMLDOMStringList2.prototype.contains = function (str) {
          return this.arr.indexOf(str) !== -1
        }
        return XMLDOMStringList2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDOMConfiguration.js
var require_XMLDOMConfiguration = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDOMConfiguration.js'(exports, module) {
    init_define_process()
    ;(function () {
      var XMLDOMConfiguration, XMLDOMErrorHandler, XMLDOMStringList
      XMLDOMErrorHandler = require_XMLDOMErrorHandler()
      XMLDOMStringList = require_XMLDOMStringList()
      module.exports = XMLDOMConfiguration = (function () {
        function XMLDOMConfiguration2() {
          var clonedSelf
          this.defaultParams = {
            'canonical-form': false,
            'cdata-sections': false,
            comments: false,
            'datatype-normalization': false,
            'element-content-whitespace': true,
            entities: true,
            'error-handler': new XMLDOMErrorHandler(),
            infoset: true,
            'validate-if-schema': false,
            namespaces: true,
            'namespace-declarations': true,
            'normalize-characters': false,
            'schema-location': '',
            'schema-type': '',
            'split-cdata-sections': true,
            validate: false,
            'well-formed': true,
          }
          this.params = clonedSelf = Object.create(this.defaultParams)
        }
        Object.defineProperty(XMLDOMConfiguration2.prototype, 'parameterNames', {
          get: function () {
            return new XMLDOMStringList(Object.keys(this.defaultParams))
          },
        })
        XMLDOMConfiguration2.prototype.getParameter = function (name) {
          if (this.params.hasOwnProperty(name)) {
            return this.params[name]
          } else {
            return null
          }
        }
        XMLDOMConfiguration2.prototype.canSetParameter = function (name, value) {
          return true
        }
        XMLDOMConfiguration2.prototype.setParameter = function (name, value) {
          if (value != null) {
            return (this.params[name] = value)
          } else {
            return delete this.params[name]
          }
        }
        return XMLDOMConfiguration2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/NodeType.js
var require_NodeType = __commonJS({
  'node_modules/xmlbuilder/lib/NodeType.js'(exports, module) {
    init_define_process()
    ;(function () {
      module.exports = {
        Element: 1,
        Attribute: 2,
        Text: 3,
        CData: 4,
        EntityReference: 5,
        EntityDeclaration: 6,
        ProcessingInstruction: 7,
        Comment: 8,
        Document: 9,
        DocType: 10,
        DocumentFragment: 11,
        NotationDeclaration: 12,
        Declaration: 201,
        Raw: 202,
        AttributeDeclaration: 203,
        ElementDeclaration: 204,
        Dummy: 205,
      }
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLAttribute.js
var require_XMLAttribute = __commonJS({
  'node_modules/xmlbuilder/lib/XMLAttribute.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType, XMLAttribute, XMLNode
      NodeType = require_NodeType()
      XMLNode = require_XMLNode()
      module.exports = XMLAttribute = (function () {
        function XMLAttribute2(parent, name, value) {
          this.parent = parent
          if (this.parent) {
            this.options = this.parent.options
            this.stringify = this.parent.stringify
          }
          if (name == null) {
            throw new Error('Missing attribute name. ' + this.debugInfo(name))
          }
          this.name = this.stringify.name(name)
          this.value = this.stringify.attValue(value)
          this.type = NodeType.Attribute
          this.isId = false
          this.schemaTypeInfo = null
        }
        Object.defineProperty(XMLAttribute2.prototype, 'nodeType', {
          get: function () {
            return this.type
          },
        })
        Object.defineProperty(XMLAttribute2.prototype, 'ownerElement', {
          get: function () {
            return this.parent
          },
        })
        Object.defineProperty(XMLAttribute2.prototype, 'textContent', {
          get: function () {
            return this.value
          },
          set: function (value) {
            return (this.value = value || '')
          },
        })
        Object.defineProperty(XMLAttribute2.prototype, 'namespaceURI', {
          get: function () {
            return ''
          },
        })
        Object.defineProperty(XMLAttribute2.prototype, 'prefix', {
          get: function () {
            return ''
          },
        })
        Object.defineProperty(XMLAttribute2.prototype, 'localName', {
          get: function () {
            return this.name
          },
        })
        Object.defineProperty(XMLAttribute2.prototype, 'specified', {
          get: function () {
            return true
          },
        })
        XMLAttribute2.prototype.clone = function () {
          return Object.create(this)
        }
        XMLAttribute2.prototype.toString = function (options) {
          return this.options.writer.attribute(this, this.options.writer.filterOptions(options))
        }
        XMLAttribute2.prototype.debugInfo = function (name) {
          name = name || this.name
          if (name == null) {
            return 'parent: <' + this.parent.name + '>'
          } else {
            return 'attribute: {' + name + '}, parent: <' + this.parent.name + '>'
          }
        }
        XMLAttribute2.prototype.isEqualNode = function (node) {
          if (node.namespaceURI !== this.namespaceURI) {
            return false
          }
          if (node.prefix !== this.prefix) {
            return false
          }
          if (node.localName !== this.localName) {
            return false
          }
          if (node.value !== this.value) {
            return false
          }
          return true
        }
        return XMLAttribute2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLNamedNodeMap.js
var require_XMLNamedNodeMap = __commonJS({
  'node_modules/xmlbuilder/lib/XMLNamedNodeMap.js'(exports, module) {
    init_define_process()
    ;(function () {
      var XMLNamedNodeMap
      module.exports = XMLNamedNodeMap = (function () {
        function XMLNamedNodeMap2(nodes) {
          this.nodes = nodes
        }
        Object.defineProperty(XMLNamedNodeMap2.prototype, 'length', {
          get: function () {
            return Object.keys(this.nodes).length || 0
          },
        })
        XMLNamedNodeMap2.prototype.clone = function () {
          return (this.nodes = null)
        }
        XMLNamedNodeMap2.prototype.getNamedItem = function (name) {
          return this.nodes[name]
        }
        XMLNamedNodeMap2.prototype.setNamedItem = function (node) {
          var oldNode
          oldNode = this.nodes[node.nodeName]
          this.nodes[node.nodeName] = node
          return oldNode || null
        }
        XMLNamedNodeMap2.prototype.removeNamedItem = function (name) {
          var oldNode
          oldNode = this.nodes[name]
          delete this.nodes[name]
          return oldNode || null
        }
        XMLNamedNodeMap2.prototype.item = function (index) {
          return this.nodes[Object.keys(this.nodes)[index]] || null
        }
        XMLNamedNodeMap2.prototype.getNamedItemNS = function (namespaceURI, localName) {
          throw new Error('This DOM method is not implemented.')
        }
        XMLNamedNodeMap2.prototype.setNamedItemNS = function (node) {
          throw new Error('This DOM method is not implemented.')
        }
        XMLNamedNodeMap2.prototype.removeNamedItemNS = function (namespaceURI, localName) {
          throw new Error('This DOM method is not implemented.')
        }
        return XMLNamedNodeMap2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLElement.js
var require_XMLElement = __commonJS({
  'node_modules/xmlbuilder/lib/XMLElement.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLAttribute,
        XMLElement,
        XMLNamedNodeMap,
        XMLNode,
        getValue,
        isFunction,
        isObject,
        ref,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      ;(ref = require_Utility()), (isObject = ref.isObject), (isFunction = ref.isFunction), (getValue = ref.getValue)
      XMLNode = require_XMLNode()
      NodeType = require_NodeType()
      XMLAttribute = require_XMLAttribute()
      XMLNamedNodeMap = require_XMLNamedNodeMap()
      module.exports = XMLElement = (function (superClass) {
        extend(XMLElement2, superClass)
        function XMLElement2(parent, name, attributes) {
          var child, j, len, ref1
          XMLElement2.__super__.constructor.call(this, parent)
          if (name == null) {
            throw new Error('Missing element name. ' + this.debugInfo())
          }
          this.name = this.stringify.name(name)
          this.type = NodeType.Element
          this.attribs = {}
          this.schemaTypeInfo = null
          if (attributes != null) {
            this.attribute(attributes)
          }
          if (parent.type === NodeType.Document) {
            this.isRoot = true
            this.documentObject = parent
            parent.rootObject = this
            if (parent.children) {
              ref1 = parent.children
              for (j = 0, len = ref1.length; j < len; j++) {
                child = ref1[j]
                if (child.type === NodeType.DocType) {
                  child.name = this.name
                  break
                }
              }
            }
          }
        }
        Object.defineProperty(XMLElement2.prototype, 'tagName', {
          get: function () {
            return this.name
          },
        })
        Object.defineProperty(XMLElement2.prototype, 'namespaceURI', {
          get: function () {
            return ''
          },
        })
        Object.defineProperty(XMLElement2.prototype, 'prefix', {
          get: function () {
            return ''
          },
        })
        Object.defineProperty(XMLElement2.prototype, 'localName', {
          get: function () {
            return this.name
          },
        })
        Object.defineProperty(XMLElement2.prototype, 'id', {
          get: function () {
            throw new Error('This DOM method is not implemented.' + this.debugInfo())
          },
        })
        Object.defineProperty(XMLElement2.prototype, 'className', {
          get: function () {
            throw new Error('This DOM method is not implemented.' + this.debugInfo())
          },
        })
        Object.defineProperty(XMLElement2.prototype, 'classList', {
          get: function () {
            throw new Error('This DOM method is not implemented.' + this.debugInfo())
          },
        })
        Object.defineProperty(XMLElement2.prototype, 'attributes', {
          get: function () {
            if (!this.attributeMap || !this.attributeMap.nodes) {
              this.attributeMap = new XMLNamedNodeMap(this.attribs)
            }
            return this.attributeMap
          },
        })
        XMLElement2.prototype.clone = function () {
          var att, attName, clonedSelf, ref1
          clonedSelf = Object.create(this)
          if (clonedSelf.isRoot) {
            clonedSelf.documentObject = null
          }
          clonedSelf.attribs = {}
          ref1 = this.attribs
          for (attName in ref1) {
            if (!hasProp.call(ref1, attName)) continue
            att = ref1[attName]
            clonedSelf.attribs[attName] = att.clone()
          }
          clonedSelf.children = []
          this.children.forEach(function (child) {
            var clonedChild
            clonedChild = child.clone()
            clonedChild.parent = clonedSelf
            return clonedSelf.children.push(clonedChild)
          })
          return clonedSelf
        }
        XMLElement2.prototype.attribute = function (name, value) {
          var attName, attValue
          if (name != null) {
            name = getValue(name)
          }
          if (isObject(name)) {
            for (attName in name) {
              if (!hasProp.call(name, attName)) continue
              attValue = name[attName]
              this.attribute(attName, attValue)
            }
          } else {
            if (isFunction(value)) {
              value = value.apply()
            }
            if (this.options.keepNullAttributes && value == null) {
              this.attribs[name] = new XMLAttribute(this, name, '')
            } else if (value != null) {
              this.attribs[name] = new XMLAttribute(this, name, value)
            }
          }
          return this
        }
        XMLElement2.prototype.removeAttribute = function (name) {
          var attName, j, len
          if (name == null) {
            throw new Error('Missing attribute name. ' + this.debugInfo())
          }
          name = getValue(name)
          if (Array.isArray(name)) {
            for (j = 0, len = name.length; j < len; j++) {
              attName = name[j]
              delete this.attribs[attName]
            }
          } else {
            delete this.attribs[name]
          }
          return this
        }
        XMLElement2.prototype.toString = function (options) {
          return this.options.writer.element(this, this.options.writer.filterOptions(options))
        }
        XMLElement2.prototype.att = function (name, value) {
          return this.attribute(name, value)
        }
        XMLElement2.prototype.a = function (name, value) {
          return this.attribute(name, value)
        }
        XMLElement2.prototype.getAttribute = function (name) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name].value
          } else {
            return null
          }
        }
        XMLElement2.prototype.setAttribute = function (name, value) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.getAttributeNode = function (name) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name]
          } else {
            return null
          }
        }
        XMLElement2.prototype.setAttributeNode = function (newAttr) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.removeAttributeNode = function (oldAttr) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.getElementsByTagName = function (name) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.getAttributeNS = function (namespaceURI, localName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.setAttributeNS = function (namespaceURI, qualifiedName, value) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.removeAttributeNS = function (namespaceURI, localName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.getAttributeNodeNS = function (namespaceURI, localName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.setAttributeNodeNS = function (newAttr) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.getElementsByTagNameNS = function (namespaceURI, localName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.hasAttribute = function (name) {
          return this.attribs.hasOwnProperty(name)
        }
        XMLElement2.prototype.hasAttributeNS = function (namespaceURI, localName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.setIdAttribute = function (name, isId) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name].isId
          } else {
            return isId
          }
        }
        XMLElement2.prototype.setIdAttributeNS = function (namespaceURI, localName, isId) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.setIdAttributeNode = function (idAttr, isId) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.getElementsByTagName = function (tagname) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.getElementsByTagNameNS = function (namespaceURI, localName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.getElementsByClassName = function (classNames) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLElement2.prototype.isEqualNode = function (node) {
          var i, j, ref1
          if (!XMLElement2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false
          }
          if (node.namespaceURI !== this.namespaceURI) {
            return false
          }
          if (node.prefix !== this.prefix) {
            return false
          }
          if (node.localName !== this.localName) {
            return false
          }
          if (node.attribs.length !== this.attribs.length) {
            return false
          }
          for (
            i = j = 0, ref1 = this.attribs.length - 1;
            0 <= ref1 ? j <= ref1 : j >= ref1;
            i = 0 <= ref1 ? ++j : --j
          ) {
            if (!this.attribs[i].isEqualNode(node.attribs[i])) {
              return false
            }
          }
          return true
        }
        return XMLElement2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLCharacterData.js
var require_XMLCharacterData = __commonJS({
  'node_modules/xmlbuilder/lib/XMLCharacterData.js'(exports, module) {
    init_define_process()
    ;(function () {
      var XMLCharacterData,
        XMLNode,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      XMLNode = require_XMLNode()
      module.exports = XMLCharacterData = (function (superClass) {
        extend(XMLCharacterData2, superClass)
        function XMLCharacterData2(parent) {
          XMLCharacterData2.__super__.constructor.call(this, parent)
          this.value = ''
        }
        Object.defineProperty(XMLCharacterData2.prototype, 'data', {
          get: function () {
            return this.value
          },
          set: function (value) {
            return (this.value = value || '')
          },
        })
        Object.defineProperty(XMLCharacterData2.prototype, 'length', {
          get: function () {
            return this.value.length
          },
        })
        Object.defineProperty(XMLCharacterData2.prototype, 'textContent', {
          get: function () {
            return this.value
          },
          set: function (value) {
            return (this.value = value || '')
          },
        })
        XMLCharacterData2.prototype.clone = function () {
          return Object.create(this)
        }
        XMLCharacterData2.prototype.substringData = function (offset, count) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLCharacterData2.prototype.appendData = function (arg) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLCharacterData2.prototype.insertData = function (offset, arg) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLCharacterData2.prototype.deleteData = function (offset, count) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLCharacterData2.prototype.replaceData = function (offset, count, arg) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLCharacterData2.prototype.isEqualNode = function (node) {
          if (!XMLCharacterData2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false
          }
          if (node.data !== this.data) {
            return false
          }
          return true
        }
        return XMLCharacterData2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLCData.js
var require_XMLCData = __commonJS({
  'node_modules/xmlbuilder/lib/XMLCData.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLCData,
        XMLCharacterData,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      NodeType = require_NodeType()
      XMLCharacterData = require_XMLCharacterData()
      module.exports = XMLCData = (function (superClass) {
        extend(XMLCData2, superClass)
        function XMLCData2(parent, text) {
          XMLCData2.__super__.constructor.call(this, parent)
          if (text == null) {
            throw new Error('Missing CDATA text. ' + this.debugInfo())
          }
          this.name = '#cdata-section'
          this.type = NodeType.CData
          this.value = this.stringify.cdata(text)
        }
        XMLCData2.prototype.clone = function () {
          return Object.create(this)
        }
        XMLCData2.prototype.toString = function (options) {
          return this.options.writer.cdata(this, this.options.writer.filterOptions(options))
        }
        return XMLCData2
      })(XMLCharacterData)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLComment.js
var require_XMLComment = __commonJS({
  'node_modules/xmlbuilder/lib/XMLComment.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLCharacterData,
        XMLComment,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      NodeType = require_NodeType()
      XMLCharacterData = require_XMLCharacterData()
      module.exports = XMLComment = (function (superClass) {
        extend(XMLComment2, superClass)
        function XMLComment2(parent, text) {
          XMLComment2.__super__.constructor.call(this, parent)
          if (text == null) {
            throw new Error('Missing comment text. ' + this.debugInfo())
          }
          this.name = '#comment'
          this.type = NodeType.Comment
          this.value = this.stringify.comment(text)
        }
        XMLComment2.prototype.clone = function () {
          return Object.create(this)
        }
        XMLComment2.prototype.toString = function (options) {
          return this.options.writer.comment(this, this.options.writer.filterOptions(options))
        }
        return XMLComment2
      })(XMLCharacterData)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDeclaration.js
var require_XMLDeclaration = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDeclaration.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLDeclaration,
        XMLNode,
        isObject,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      isObject = require_Utility().isObject
      XMLNode = require_XMLNode()
      NodeType = require_NodeType()
      module.exports = XMLDeclaration = (function (superClass) {
        extend(XMLDeclaration2, superClass)
        function XMLDeclaration2(parent, version, encoding, standalone) {
          var ref
          XMLDeclaration2.__super__.constructor.call(this, parent)
          if (isObject(version)) {
            ;(ref = version), (version = ref.version), (encoding = ref.encoding), (standalone = ref.standalone)
          }
          if (!version) {
            version = '1.0'
          }
          this.type = NodeType.Declaration
          this.version = this.stringify.xmlVersion(version)
          if (encoding != null) {
            this.encoding = this.stringify.xmlEncoding(encoding)
          }
          if (standalone != null) {
            this.standalone = this.stringify.xmlStandalone(standalone)
          }
        }
        XMLDeclaration2.prototype.toString = function (options) {
          return this.options.writer.declaration(this, this.options.writer.filterOptions(options))
        }
        return XMLDeclaration2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDTDAttList.js
var require_XMLDTDAttList = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDTDAttList.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLDTDAttList,
        XMLNode,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      XMLNode = require_XMLNode()
      NodeType = require_NodeType()
      module.exports = XMLDTDAttList = (function (superClass) {
        extend(XMLDTDAttList2, superClass)
        function XMLDTDAttList2(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          XMLDTDAttList2.__super__.constructor.call(this, parent)
          if (elementName == null) {
            throw new Error('Missing DTD element name. ' + this.debugInfo())
          }
          if (attributeName == null) {
            throw new Error('Missing DTD attribute name. ' + this.debugInfo(elementName))
          }
          if (!attributeType) {
            throw new Error('Missing DTD attribute type. ' + this.debugInfo(elementName))
          }
          if (!defaultValueType) {
            throw new Error('Missing DTD attribute default. ' + this.debugInfo(elementName))
          }
          if (defaultValueType.indexOf('#') !== 0) {
            defaultValueType = '#' + defaultValueType
          }
          if (!defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) {
            throw new Error(
              'Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT. ' +
                this.debugInfo(elementName),
            )
          }
          if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) {
            throw new Error('Default value only applies to #FIXED or #DEFAULT. ' + this.debugInfo(elementName))
          }
          this.elementName = this.stringify.name(elementName)
          this.type = NodeType.AttributeDeclaration
          this.attributeName = this.stringify.name(attributeName)
          this.attributeType = this.stringify.dtdAttType(attributeType)
          if (defaultValue) {
            this.defaultValue = this.stringify.dtdAttDefault(defaultValue)
          }
          this.defaultValueType = defaultValueType
        }
        XMLDTDAttList2.prototype.toString = function (options) {
          return this.options.writer.dtdAttList(this, this.options.writer.filterOptions(options))
        }
        return XMLDTDAttList2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDTDEntity.js
var require_XMLDTDEntity = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDTDEntity.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLDTDEntity,
        XMLNode,
        isObject,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      isObject = require_Utility().isObject
      XMLNode = require_XMLNode()
      NodeType = require_NodeType()
      module.exports = XMLDTDEntity = (function (superClass) {
        extend(XMLDTDEntity2, superClass)
        function XMLDTDEntity2(parent, pe, name, value) {
          XMLDTDEntity2.__super__.constructor.call(this, parent)
          if (name == null) {
            throw new Error('Missing DTD entity name. ' + this.debugInfo(name))
          }
          if (value == null) {
            throw new Error('Missing DTD entity value. ' + this.debugInfo(name))
          }
          this.pe = !!pe
          this.name = this.stringify.name(name)
          this.type = NodeType.EntityDeclaration
          if (!isObject(value)) {
            this.value = this.stringify.dtdEntityValue(value)
            this.internal = true
          } else {
            if (!value.pubID && !value.sysID) {
              throw new Error(
                'Public and/or system identifiers are required for an external entity. ' + this.debugInfo(name),
              )
            }
            if (value.pubID && !value.sysID) {
              throw new Error('System identifier is required for a public external entity. ' + this.debugInfo(name))
            }
            this.internal = false
            if (value.pubID != null) {
              this.pubID = this.stringify.dtdPubID(value.pubID)
            }
            if (value.sysID != null) {
              this.sysID = this.stringify.dtdSysID(value.sysID)
            }
            if (value.nData != null) {
              this.nData = this.stringify.dtdNData(value.nData)
            }
            if (this.pe && this.nData) {
              throw new Error('Notation declaration is not allowed in a parameter entity. ' + this.debugInfo(name))
            }
          }
        }
        Object.defineProperty(XMLDTDEntity2.prototype, 'publicId', {
          get: function () {
            return this.pubID
          },
        })
        Object.defineProperty(XMLDTDEntity2.prototype, 'systemId', {
          get: function () {
            return this.sysID
          },
        })
        Object.defineProperty(XMLDTDEntity2.prototype, 'notationName', {
          get: function () {
            return this.nData || null
          },
        })
        Object.defineProperty(XMLDTDEntity2.prototype, 'inputEncoding', {
          get: function () {
            return null
          },
        })
        Object.defineProperty(XMLDTDEntity2.prototype, 'xmlEncoding', {
          get: function () {
            return null
          },
        })
        Object.defineProperty(XMLDTDEntity2.prototype, 'xmlVersion', {
          get: function () {
            return null
          },
        })
        XMLDTDEntity2.prototype.toString = function (options) {
          return this.options.writer.dtdEntity(this, this.options.writer.filterOptions(options))
        }
        return XMLDTDEntity2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDTDElement.js
var require_XMLDTDElement = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDTDElement.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLDTDElement,
        XMLNode,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      XMLNode = require_XMLNode()
      NodeType = require_NodeType()
      module.exports = XMLDTDElement = (function (superClass) {
        extend(XMLDTDElement2, superClass)
        function XMLDTDElement2(parent, name, value) {
          XMLDTDElement2.__super__.constructor.call(this, parent)
          if (name == null) {
            throw new Error('Missing DTD element name. ' + this.debugInfo())
          }
          if (!value) {
            value = '(#PCDATA)'
          }
          if (Array.isArray(value)) {
            value = '(' + value.join(',') + ')'
          }
          this.name = this.stringify.name(name)
          this.type = NodeType.ElementDeclaration
          this.value = this.stringify.dtdElementValue(value)
        }
        XMLDTDElement2.prototype.toString = function (options) {
          return this.options.writer.dtdElement(this, this.options.writer.filterOptions(options))
        }
        return XMLDTDElement2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDTDNotation.js
var require_XMLDTDNotation = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDTDNotation.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLDTDNotation,
        XMLNode,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      XMLNode = require_XMLNode()
      NodeType = require_NodeType()
      module.exports = XMLDTDNotation = (function (superClass) {
        extend(XMLDTDNotation2, superClass)
        function XMLDTDNotation2(parent, name, value) {
          XMLDTDNotation2.__super__.constructor.call(this, parent)
          if (name == null) {
            throw new Error('Missing DTD notation name. ' + this.debugInfo(name))
          }
          if (!value.pubID && !value.sysID) {
            throw new Error('Public or system identifiers are required for an external entity. ' + this.debugInfo(name))
          }
          this.name = this.stringify.name(name)
          this.type = NodeType.NotationDeclaration
          if (value.pubID != null) {
            this.pubID = this.stringify.dtdPubID(value.pubID)
          }
          if (value.sysID != null) {
            this.sysID = this.stringify.dtdSysID(value.sysID)
          }
        }
        Object.defineProperty(XMLDTDNotation2.prototype, 'publicId', {
          get: function () {
            return this.pubID
          },
        })
        Object.defineProperty(XMLDTDNotation2.prototype, 'systemId', {
          get: function () {
            return this.sysID
          },
        })
        XMLDTDNotation2.prototype.toString = function (options) {
          return this.options.writer.dtdNotation(this, this.options.writer.filterOptions(options))
        }
        return XMLDTDNotation2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDocType.js
var require_XMLDocType = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDocType.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLDTDAttList,
        XMLDTDElement,
        XMLDTDEntity,
        XMLDTDNotation,
        XMLDocType,
        XMLNamedNodeMap,
        XMLNode,
        isObject,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      isObject = require_Utility().isObject
      XMLNode = require_XMLNode()
      NodeType = require_NodeType()
      XMLDTDAttList = require_XMLDTDAttList()
      XMLDTDEntity = require_XMLDTDEntity()
      XMLDTDElement = require_XMLDTDElement()
      XMLDTDNotation = require_XMLDTDNotation()
      XMLNamedNodeMap = require_XMLNamedNodeMap()
      module.exports = XMLDocType = (function (superClass) {
        extend(XMLDocType2, superClass)
        function XMLDocType2(parent, pubID, sysID) {
          var child, i, len, ref, ref1, ref2
          XMLDocType2.__super__.constructor.call(this, parent)
          this.type = NodeType.DocType
          if (parent.children) {
            ref = parent.children
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i]
              if (child.type === NodeType.Element) {
                this.name = child.name
                break
              }
            }
          }
          this.documentObject = parent
          if (isObject(pubID)) {
            ;(ref1 = pubID), (pubID = ref1.pubID), (sysID = ref1.sysID)
          }
          if (sysID == null) {
            ;(ref2 = [pubID, sysID]), (sysID = ref2[0]), (pubID = ref2[1])
          }
          if (pubID != null) {
            this.pubID = this.stringify.dtdPubID(pubID)
          }
          if (sysID != null) {
            this.sysID = this.stringify.dtdSysID(sysID)
          }
        }
        Object.defineProperty(XMLDocType2.prototype, 'entities', {
          get: function () {
            var child, i, len, nodes, ref
            nodes = {}
            ref = this.children
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i]
              if (child.type === NodeType.EntityDeclaration && !child.pe) {
                nodes[child.name] = child
              }
            }
            return new XMLNamedNodeMap(nodes)
          },
        })
        Object.defineProperty(XMLDocType2.prototype, 'notations', {
          get: function () {
            var child, i, len, nodes, ref
            nodes = {}
            ref = this.children
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i]
              if (child.type === NodeType.NotationDeclaration) {
                nodes[child.name] = child
              }
            }
            return new XMLNamedNodeMap(nodes)
          },
        })
        Object.defineProperty(XMLDocType2.prototype, 'publicId', {
          get: function () {
            return this.pubID
          },
        })
        Object.defineProperty(XMLDocType2.prototype, 'systemId', {
          get: function () {
            return this.sysID
          },
        })
        Object.defineProperty(XMLDocType2.prototype, 'internalSubset', {
          get: function () {
            throw new Error('This DOM method is not implemented.' + this.debugInfo())
          },
        })
        XMLDocType2.prototype.element = function (name, value) {
          var child
          child = new XMLDTDElement(this, name, value)
          this.children.push(child)
          return this
        }
        XMLDocType2.prototype.attList = function (
          elementName,
          attributeName,
          attributeType,
          defaultValueType,
          defaultValue,
        ) {
          var child
          child = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue)
          this.children.push(child)
          return this
        }
        XMLDocType2.prototype.entity = function (name, value) {
          var child
          child = new XMLDTDEntity(this, false, name, value)
          this.children.push(child)
          return this
        }
        XMLDocType2.prototype.pEntity = function (name, value) {
          var child
          child = new XMLDTDEntity(this, true, name, value)
          this.children.push(child)
          return this
        }
        XMLDocType2.prototype.notation = function (name, value) {
          var child
          child = new XMLDTDNotation(this, name, value)
          this.children.push(child)
          return this
        }
        XMLDocType2.prototype.toString = function (options) {
          return this.options.writer.docType(this, this.options.writer.filterOptions(options))
        }
        XMLDocType2.prototype.ele = function (name, value) {
          return this.element(name, value)
        }
        XMLDocType2.prototype.att = function (
          elementName,
          attributeName,
          attributeType,
          defaultValueType,
          defaultValue,
        ) {
          return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue)
        }
        XMLDocType2.prototype.ent = function (name, value) {
          return this.entity(name, value)
        }
        XMLDocType2.prototype.pent = function (name, value) {
          return this.pEntity(name, value)
        }
        XMLDocType2.prototype.not = function (name, value) {
          return this.notation(name, value)
        }
        XMLDocType2.prototype.up = function () {
          return this.root() || this.documentObject
        }
        XMLDocType2.prototype.isEqualNode = function (node) {
          if (!XMLDocType2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false
          }
          if (node.name !== this.name) {
            return false
          }
          if (node.publicId !== this.publicId) {
            return false
          }
          if (node.systemId !== this.systemId) {
            return false
          }
          return true
        }
        return XMLDocType2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLRaw.js
var require_XMLRaw = __commonJS({
  'node_modules/xmlbuilder/lib/XMLRaw.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLNode,
        XMLRaw,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      NodeType = require_NodeType()
      XMLNode = require_XMLNode()
      module.exports = XMLRaw = (function (superClass) {
        extend(XMLRaw2, superClass)
        function XMLRaw2(parent, text) {
          XMLRaw2.__super__.constructor.call(this, parent)
          if (text == null) {
            throw new Error('Missing raw text. ' + this.debugInfo())
          }
          this.type = NodeType.Raw
          this.value = this.stringify.raw(text)
        }
        XMLRaw2.prototype.clone = function () {
          return Object.create(this)
        }
        XMLRaw2.prototype.toString = function (options) {
          return this.options.writer.raw(this, this.options.writer.filterOptions(options))
        }
        return XMLRaw2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLText.js
var require_XMLText = __commonJS({
  'node_modules/xmlbuilder/lib/XMLText.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLCharacterData,
        XMLText,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      NodeType = require_NodeType()
      XMLCharacterData = require_XMLCharacterData()
      module.exports = XMLText = (function (superClass) {
        extend(XMLText2, superClass)
        function XMLText2(parent, text) {
          XMLText2.__super__.constructor.call(this, parent)
          if (text == null) {
            throw new Error('Missing element text. ' + this.debugInfo())
          }
          this.name = '#text'
          this.type = NodeType.Text
          this.value = this.stringify.text(text)
        }
        Object.defineProperty(XMLText2.prototype, 'isElementContentWhitespace', {
          get: function () {
            throw new Error('This DOM method is not implemented.' + this.debugInfo())
          },
        })
        Object.defineProperty(XMLText2.prototype, 'wholeText', {
          get: function () {
            var next, prev, str
            str = ''
            prev = this.previousSibling
            while (prev) {
              str = prev.data + str
              prev = prev.previousSibling
            }
            str += this.data
            next = this.nextSibling
            while (next) {
              str = str + next.data
              next = next.nextSibling
            }
            return str
          },
        })
        XMLText2.prototype.clone = function () {
          return Object.create(this)
        }
        XMLText2.prototype.toString = function (options) {
          return this.options.writer.text(this, this.options.writer.filterOptions(options))
        }
        XMLText2.prototype.splitText = function (offset) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLText2.prototype.replaceWholeText = function (content) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        return XMLText2
      })(XMLCharacterData)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLProcessingInstruction.js
var require_XMLProcessingInstruction = __commonJS({
  'node_modules/xmlbuilder/lib/XMLProcessingInstruction.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLCharacterData,
        XMLProcessingInstruction,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      NodeType = require_NodeType()
      XMLCharacterData = require_XMLCharacterData()
      module.exports = XMLProcessingInstruction = (function (superClass) {
        extend(XMLProcessingInstruction2, superClass)
        function XMLProcessingInstruction2(parent, target, value) {
          XMLProcessingInstruction2.__super__.constructor.call(this, parent)
          if (target == null) {
            throw new Error('Missing instruction target. ' + this.debugInfo())
          }
          this.type = NodeType.ProcessingInstruction
          this.target = this.stringify.insTarget(target)
          this.name = this.target
          if (value) {
            this.value = this.stringify.insValue(value)
          }
        }
        XMLProcessingInstruction2.prototype.clone = function () {
          return Object.create(this)
        }
        XMLProcessingInstruction2.prototype.toString = function (options) {
          return this.options.writer.processingInstruction(this, this.options.writer.filterOptions(options))
        }
        XMLProcessingInstruction2.prototype.isEqualNode = function (node) {
          if (!XMLProcessingInstruction2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false
          }
          if (node.target !== this.target) {
            return false
          }
          return true
        }
        return XMLProcessingInstruction2
      })(XMLCharacterData)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDummy.js
var require_XMLDummy = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDummy.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLDummy,
        XMLNode,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      XMLNode = require_XMLNode()
      NodeType = require_NodeType()
      module.exports = XMLDummy = (function (superClass) {
        extend(XMLDummy2, superClass)
        function XMLDummy2(parent) {
          XMLDummy2.__super__.constructor.call(this, parent)
          this.type = NodeType.Dummy
        }
        XMLDummy2.prototype.clone = function () {
          return Object.create(this)
        }
        XMLDummy2.prototype.toString = function (options) {
          return ''
        }
        return XMLDummy2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLNodeList.js
var require_XMLNodeList = __commonJS({
  'node_modules/xmlbuilder/lib/XMLNodeList.js'(exports, module) {
    init_define_process()
    ;(function () {
      var XMLNodeList
      module.exports = XMLNodeList = (function () {
        function XMLNodeList2(nodes) {
          this.nodes = nodes
        }
        Object.defineProperty(XMLNodeList2.prototype, 'length', {
          get: function () {
            return this.nodes.length || 0
          },
        })
        XMLNodeList2.prototype.clone = function () {
          return (this.nodes = null)
        }
        XMLNodeList2.prototype.item = function (index) {
          return this.nodes[index] || null
        }
        return XMLNodeList2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/DocumentPosition.js
var require_DocumentPosition = __commonJS({
  'node_modules/xmlbuilder/lib/DocumentPosition.js'(exports, module) {
    init_define_process()
    ;(function () {
      module.exports = {
        Disconnected: 1,
        Preceding: 2,
        Following: 4,
        Contains: 8,
        ContainedBy: 16,
        ImplementationSpecific: 32,
      }
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLNode.js
var require_XMLNode = __commonJS({
  'node_modules/xmlbuilder/lib/XMLNode.js'(exports, module) {
    init_define_process()
    ;(function () {
      var DocumentPosition,
        NodeType,
        XMLCData,
        XMLComment,
        XMLDeclaration,
        XMLDocType,
        XMLDummy,
        XMLElement,
        XMLNamedNodeMap,
        XMLNode,
        XMLNodeList,
        XMLProcessingInstruction,
        XMLRaw,
        XMLText,
        getValue,
        isEmpty,
        isFunction,
        isObject,
        ref1,
        hasProp = {}.hasOwnProperty
      ;(ref1 = require_Utility()),
        (isObject = ref1.isObject),
        (isFunction = ref1.isFunction),
        (isEmpty = ref1.isEmpty),
        (getValue = ref1.getValue)
      XMLElement = null
      XMLCData = null
      XMLComment = null
      XMLDeclaration = null
      XMLDocType = null
      XMLRaw = null
      XMLText = null
      XMLProcessingInstruction = null
      XMLDummy = null
      NodeType = null
      XMLNodeList = null
      XMLNamedNodeMap = null
      DocumentPosition = null
      module.exports = XMLNode = (function () {
        function XMLNode2(parent1) {
          this.parent = parent1
          if (this.parent) {
            this.options = this.parent.options
            this.stringify = this.parent.stringify
          }
          this.value = null
          this.children = []
          this.baseURI = null
          if (!XMLElement) {
            XMLElement = require_XMLElement()
            XMLCData = require_XMLCData()
            XMLComment = require_XMLComment()
            XMLDeclaration = require_XMLDeclaration()
            XMLDocType = require_XMLDocType()
            XMLRaw = require_XMLRaw()
            XMLText = require_XMLText()
            XMLProcessingInstruction = require_XMLProcessingInstruction()
            XMLDummy = require_XMLDummy()
            NodeType = require_NodeType()
            XMLNodeList = require_XMLNodeList()
            XMLNamedNodeMap = require_XMLNamedNodeMap()
            DocumentPosition = require_DocumentPosition()
          }
        }
        Object.defineProperty(XMLNode2.prototype, 'nodeName', {
          get: function () {
            return this.name
          },
        })
        Object.defineProperty(XMLNode2.prototype, 'nodeType', {
          get: function () {
            return this.type
          },
        })
        Object.defineProperty(XMLNode2.prototype, 'nodeValue', {
          get: function () {
            return this.value
          },
        })
        Object.defineProperty(XMLNode2.prototype, 'parentNode', {
          get: function () {
            return this.parent
          },
        })
        Object.defineProperty(XMLNode2.prototype, 'childNodes', {
          get: function () {
            if (!this.childNodeList || !this.childNodeList.nodes) {
              this.childNodeList = new XMLNodeList(this.children)
            }
            return this.childNodeList
          },
        })
        Object.defineProperty(XMLNode2.prototype, 'firstChild', {
          get: function () {
            return this.children[0] || null
          },
        })
        Object.defineProperty(XMLNode2.prototype, 'lastChild', {
          get: function () {
            return this.children[this.children.length - 1] || null
          },
        })
        Object.defineProperty(XMLNode2.prototype, 'previousSibling', {
          get: function () {
            var i
            i = this.parent.children.indexOf(this)
            return this.parent.children[i - 1] || null
          },
        })
        Object.defineProperty(XMLNode2.prototype, 'nextSibling', {
          get: function () {
            var i
            i = this.parent.children.indexOf(this)
            return this.parent.children[i + 1] || null
          },
        })
        Object.defineProperty(XMLNode2.prototype, 'ownerDocument', {
          get: function () {
            return this.document() || null
          },
        })
        Object.defineProperty(XMLNode2.prototype, 'textContent', {
          get: function () {
            var child, j, len, ref2, str
            if (this.nodeType === NodeType.Element || this.nodeType === NodeType.DocumentFragment) {
              str = ''
              ref2 = this.children
              for (j = 0, len = ref2.length; j < len; j++) {
                child = ref2[j]
                if (child.textContent) {
                  str += child.textContent
                }
              }
              return str
            } else {
              return null
            }
          },
          set: function (value) {
            throw new Error('This DOM method is not implemented.' + this.debugInfo())
          },
        })
        XMLNode2.prototype.setParent = function (parent) {
          var child, j, len, ref2, results
          this.parent = parent
          if (parent) {
            this.options = parent.options
            this.stringify = parent.stringify
          }
          ref2 = this.children
          results = []
          for (j = 0, len = ref2.length; j < len; j++) {
            child = ref2[j]
            results.push(child.setParent(this))
          }
          return results
        }
        XMLNode2.prototype.element = function (name, attributes, text) {
          var childNode, item, j, k, key, lastChild, len, len1, ref2, ref3, val
          lastChild = null
          if (attributes === null && text == null) {
            ;(ref2 = [{}, null]), (attributes = ref2[0]), (text = ref2[1])
          }
          if (attributes == null) {
            attributes = {}
          }
          attributes = getValue(attributes)
          if (!isObject(attributes)) {
            ;(ref3 = [attributes, text]), (text = ref3[0]), (attributes = ref3[1])
          }
          if (name != null) {
            name = getValue(name)
          }
          if (Array.isArray(name)) {
            for (j = 0, len = name.length; j < len; j++) {
              item = name[j]
              lastChild = this.element(item)
            }
          } else if (isFunction(name)) {
            lastChild = this.element(name.apply())
          } else if (isObject(name)) {
            for (key in name) {
              if (!hasProp.call(name, key)) continue
              val = name[key]
              if (isFunction(val)) {
                val = val.apply()
              }
              if (
                !this.options.ignoreDecorators &&
                this.stringify.convertAttKey &&
                key.indexOf(this.stringify.convertAttKey) === 0
              ) {
                lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val)
              } else if (!this.options.separateArrayItems && Array.isArray(val) && isEmpty(val)) {
                lastChild = this.dummy()
              } else if (isObject(val) && isEmpty(val)) {
                lastChild = this.element(key)
              } else if (!this.options.keepNullNodes && val == null) {
                lastChild = this.dummy()
              } else if (!this.options.separateArrayItems && Array.isArray(val)) {
                for (k = 0, len1 = val.length; k < len1; k++) {
                  item = val[k]
                  childNode = {}
                  childNode[key] = item
                  lastChild = this.element(childNode)
                }
              } else if (isObject(val)) {
                if (
                  !this.options.ignoreDecorators &&
                  this.stringify.convertTextKey &&
                  key.indexOf(this.stringify.convertTextKey) === 0
                ) {
                  lastChild = this.element(val)
                } else {
                  lastChild = this.element(key)
                  lastChild.element(val)
                }
              } else {
                lastChild = this.element(key, val)
              }
            }
          } else if (!this.options.keepNullNodes && text === null) {
            lastChild = this.dummy()
          } else {
            if (
              !this.options.ignoreDecorators &&
              this.stringify.convertTextKey &&
              name.indexOf(this.stringify.convertTextKey) === 0
            ) {
              lastChild = this.text(text)
            } else if (
              !this.options.ignoreDecorators &&
              this.stringify.convertCDataKey &&
              name.indexOf(this.stringify.convertCDataKey) === 0
            ) {
              lastChild = this.cdata(text)
            } else if (
              !this.options.ignoreDecorators &&
              this.stringify.convertCommentKey &&
              name.indexOf(this.stringify.convertCommentKey) === 0
            ) {
              lastChild = this.comment(text)
            } else if (
              !this.options.ignoreDecorators &&
              this.stringify.convertRawKey &&
              name.indexOf(this.stringify.convertRawKey) === 0
            ) {
              lastChild = this.raw(text)
            } else if (
              !this.options.ignoreDecorators &&
              this.stringify.convertPIKey &&
              name.indexOf(this.stringify.convertPIKey) === 0
            ) {
              lastChild = this.instruction(name.substr(this.stringify.convertPIKey.length), text)
            } else {
              lastChild = this.node(name, attributes, text)
            }
          }
          if (lastChild == null) {
            throw new Error('Could not create any elements with: ' + name + '. ' + this.debugInfo())
          }
          return lastChild
        }
        XMLNode2.prototype.insertBefore = function (name, attributes, text) {
          var child, i, newChild, refChild, removed
          if (name != null ? name.type : void 0) {
            newChild = name
            refChild = attributes
            newChild.setParent(this)
            if (refChild) {
              i = children.indexOf(refChild)
              removed = children.splice(i)
              children.push(newChild)
              Array.prototype.push.apply(children, removed)
            } else {
              children.push(newChild)
            }
            return newChild
          } else {
            if (this.isRoot) {
              throw new Error('Cannot insert elements at root level. ' + this.debugInfo(name))
            }
            i = this.parent.children.indexOf(this)
            removed = this.parent.children.splice(i)
            child = this.parent.element(name, attributes, text)
            Array.prototype.push.apply(this.parent.children, removed)
            return child
          }
        }
        XMLNode2.prototype.insertAfter = function (name, attributes, text) {
          var child, i, removed
          if (this.isRoot) {
            throw new Error('Cannot insert elements at root level. ' + this.debugInfo(name))
          }
          i = this.parent.children.indexOf(this)
          removed = this.parent.children.splice(i + 1)
          child = this.parent.element(name, attributes, text)
          Array.prototype.push.apply(this.parent.children, removed)
          return child
        }
        XMLNode2.prototype.remove = function () {
          var i, ref2
          if (this.isRoot) {
            throw new Error('Cannot remove the root element. ' + this.debugInfo())
          }
          i = this.parent.children.indexOf(this)
          ;[].splice.apply(this.parent.children, [i, i - i + 1].concat((ref2 = []))), ref2
          return this.parent
        }
        XMLNode2.prototype.node = function (name, attributes, text) {
          var child, ref2
          if (name != null) {
            name = getValue(name)
          }
          attributes || (attributes = {})
          attributes = getValue(attributes)
          if (!isObject(attributes)) {
            ;(ref2 = [attributes, text]), (text = ref2[0]), (attributes = ref2[1])
          }
          child = new XMLElement(this, name, attributes)
          if (text != null) {
            child.text(text)
          }
          this.children.push(child)
          return child
        }
        XMLNode2.prototype.text = function (value) {
          var child
          if (isObject(value)) {
            this.element(value)
          }
          child = new XMLText(this, value)
          this.children.push(child)
          return this
        }
        XMLNode2.prototype.cdata = function (value) {
          var child
          child = new XMLCData(this, value)
          this.children.push(child)
          return this
        }
        XMLNode2.prototype.comment = function (value) {
          var child
          child = new XMLComment(this, value)
          this.children.push(child)
          return this
        }
        XMLNode2.prototype.commentBefore = function (value) {
          var child, i, removed
          i = this.parent.children.indexOf(this)
          removed = this.parent.children.splice(i)
          child = this.parent.comment(value)
          Array.prototype.push.apply(this.parent.children, removed)
          return this
        }
        XMLNode2.prototype.commentAfter = function (value) {
          var child, i, removed
          i = this.parent.children.indexOf(this)
          removed = this.parent.children.splice(i + 1)
          child = this.parent.comment(value)
          Array.prototype.push.apply(this.parent.children, removed)
          return this
        }
        XMLNode2.prototype.raw = function (value) {
          var child
          child = new XMLRaw(this, value)
          this.children.push(child)
          return this
        }
        XMLNode2.prototype.dummy = function () {
          var child
          child = new XMLDummy(this)
          return child
        }
        XMLNode2.prototype.instruction = function (target, value) {
          var insTarget, insValue, instruction, j, len
          if (target != null) {
            target = getValue(target)
          }
          if (value != null) {
            value = getValue(value)
          }
          if (Array.isArray(target)) {
            for (j = 0, len = target.length; j < len; j++) {
              insTarget = target[j]
              this.instruction(insTarget)
            }
          } else if (isObject(target)) {
            for (insTarget in target) {
              if (!hasProp.call(target, insTarget)) continue
              insValue = target[insTarget]
              this.instruction(insTarget, insValue)
            }
          } else {
            if (isFunction(value)) {
              value = value.apply()
            }
            instruction = new XMLProcessingInstruction(this, target, value)
            this.children.push(instruction)
          }
          return this
        }
        XMLNode2.prototype.instructionBefore = function (target, value) {
          var child, i, removed
          i = this.parent.children.indexOf(this)
          removed = this.parent.children.splice(i)
          child = this.parent.instruction(target, value)
          Array.prototype.push.apply(this.parent.children, removed)
          return this
        }
        XMLNode2.prototype.instructionAfter = function (target, value) {
          var child, i, removed
          i = this.parent.children.indexOf(this)
          removed = this.parent.children.splice(i + 1)
          child = this.parent.instruction(target, value)
          Array.prototype.push.apply(this.parent.children, removed)
          return this
        }
        XMLNode2.prototype.declaration = function (version, encoding, standalone) {
          var doc, xmldec
          doc = this.document()
          xmldec = new XMLDeclaration(doc, version, encoding, standalone)
          if (doc.children.length === 0) {
            doc.children.unshift(xmldec)
          } else if (doc.children[0].type === NodeType.Declaration) {
            doc.children[0] = xmldec
          } else {
            doc.children.unshift(xmldec)
          }
          return doc.root() || doc
        }
        XMLNode2.prototype.dtd = function (pubID, sysID) {
          var child, doc, doctype, i, j, k, len, len1, ref2, ref3
          doc = this.document()
          doctype = new XMLDocType(doc, pubID, sysID)
          ref2 = doc.children
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            child = ref2[i]
            if (child.type === NodeType.DocType) {
              doc.children[i] = doctype
              return doctype
            }
          }
          ref3 = doc.children
          for (i = k = 0, len1 = ref3.length; k < len1; i = ++k) {
            child = ref3[i]
            if (child.isRoot) {
              doc.children.splice(i, 0, doctype)
              return doctype
            }
          }
          doc.children.push(doctype)
          return doctype
        }
        XMLNode2.prototype.up = function () {
          if (this.isRoot) {
            throw new Error('The root node has no parent. Use doc() if you need to get the document object.')
          }
          return this.parent
        }
        XMLNode2.prototype.root = function () {
          var node
          node = this
          while (node) {
            if (node.type === NodeType.Document) {
              return node.rootObject
            } else if (node.isRoot) {
              return node
            } else {
              node = node.parent
            }
          }
        }
        XMLNode2.prototype.document = function () {
          var node
          node = this
          while (node) {
            if (node.type === NodeType.Document) {
              return node
            } else {
              node = node.parent
            }
          }
        }
        XMLNode2.prototype.end = function (options) {
          return this.document().end(options)
        }
        XMLNode2.prototype.prev = function () {
          var i
          i = this.parent.children.indexOf(this)
          if (i < 1) {
            throw new Error('Already at the first node. ' + this.debugInfo())
          }
          return this.parent.children[i - 1]
        }
        XMLNode2.prototype.next = function () {
          var i
          i = this.parent.children.indexOf(this)
          if (i === -1 || i === this.parent.children.length - 1) {
            throw new Error('Already at the last node. ' + this.debugInfo())
          }
          return this.parent.children[i + 1]
        }
        XMLNode2.prototype.importDocument = function (doc) {
          var clonedRoot
          clonedRoot = doc.root().clone()
          clonedRoot.parent = this
          clonedRoot.isRoot = false
          this.children.push(clonedRoot)
          return this
        }
        XMLNode2.prototype.debugInfo = function (name) {
          var ref2, ref3
          name = name || this.name
          if (name == null && !((ref2 = this.parent) != null ? ref2.name : void 0)) {
            return ''
          } else if (name == null) {
            return 'parent: <' + this.parent.name + '>'
          } else if (!((ref3 = this.parent) != null ? ref3.name : void 0)) {
            return 'node: <' + name + '>'
          } else {
            return 'node: <' + name + '>, parent: <' + this.parent.name + '>'
          }
        }
        XMLNode2.prototype.ele = function (name, attributes, text) {
          return this.element(name, attributes, text)
        }
        XMLNode2.prototype.nod = function (name, attributes, text) {
          return this.node(name, attributes, text)
        }
        XMLNode2.prototype.txt = function (value) {
          return this.text(value)
        }
        XMLNode2.prototype.dat = function (value) {
          return this.cdata(value)
        }
        XMLNode2.prototype.com = function (value) {
          return this.comment(value)
        }
        XMLNode2.prototype.ins = function (target, value) {
          return this.instruction(target, value)
        }
        XMLNode2.prototype.doc = function () {
          return this.document()
        }
        XMLNode2.prototype.dec = function (version, encoding, standalone) {
          return this.declaration(version, encoding, standalone)
        }
        XMLNode2.prototype.e = function (name, attributes, text) {
          return this.element(name, attributes, text)
        }
        XMLNode2.prototype.n = function (name, attributes, text) {
          return this.node(name, attributes, text)
        }
        XMLNode2.prototype.t = function (value) {
          return this.text(value)
        }
        XMLNode2.prototype.d = function (value) {
          return this.cdata(value)
        }
        XMLNode2.prototype.c = function (value) {
          return this.comment(value)
        }
        XMLNode2.prototype.r = function (value) {
          return this.raw(value)
        }
        XMLNode2.prototype.i = function (target, value) {
          return this.instruction(target, value)
        }
        XMLNode2.prototype.u = function () {
          return this.up()
        }
        XMLNode2.prototype.importXMLBuilder = function (doc) {
          return this.importDocument(doc)
        }
        XMLNode2.prototype.replaceChild = function (newChild, oldChild) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.removeChild = function (oldChild) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.appendChild = function (newChild) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.hasChildNodes = function () {
          return this.children.length !== 0
        }
        XMLNode2.prototype.cloneNode = function (deep) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.normalize = function () {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.isSupported = function (feature, version) {
          return true
        }
        XMLNode2.prototype.hasAttributes = function () {
          return this.attribs.length !== 0
        }
        XMLNode2.prototype.compareDocumentPosition = function (other) {
          var ref, res
          ref = this
          if (ref === other) {
            return 0
          } else if (this.document() !== other.document()) {
            res = DocumentPosition.Disconnected | DocumentPosition.ImplementationSpecific
            if (Math.random() < 0.5) {
              res |= DocumentPosition.Preceding
            } else {
              res |= DocumentPosition.Following
            }
            return res
          } else if (ref.isAncestor(other)) {
            return DocumentPosition.Contains | DocumentPosition.Preceding
          } else if (ref.isDescendant(other)) {
            return DocumentPosition.Contains | DocumentPosition.Following
          } else if (ref.isPreceding(other)) {
            return DocumentPosition.Preceding
          } else {
            return DocumentPosition.Following
          }
        }
        XMLNode2.prototype.isSameNode = function (other) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.lookupPrefix = function (namespaceURI) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.isDefaultNamespace = function (namespaceURI) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.lookupNamespaceURI = function (prefix) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.isEqualNode = function (node) {
          var i, j, ref2
          if (node.nodeType !== this.nodeType) {
            return false
          }
          if (node.children.length !== this.children.length) {
            return false
          }
          for (
            i = j = 0, ref2 = this.children.length - 1;
            0 <= ref2 ? j <= ref2 : j >= ref2;
            i = 0 <= ref2 ? ++j : --j
          ) {
            if (!this.children[i].isEqualNode(node.children[i])) {
              return false
            }
          }
          return true
        }
        XMLNode2.prototype.getFeature = function (feature, version) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.setUserData = function (key, data, handler) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.getUserData = function (key) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLNode2.prototype.contains = function (other) {
          if (!other) {
            return false
          }
          return other === this || this.isDescendant(other)
        }
        XMLNode2.prototype.isDescendant = function (node) {
          var child, isDescendantChild, j, len, ref2
          ref2 = this.children
          for (j = 0, len = ref2.length; j < len; j++) {
            child = ref2[j]
            if (node === child) {
              return true
            }
            isDescendantChild = child.isDescendant(node)
            if (isDescendantChild) {
              return true
            }
          }
          return false
        }
        XMLNode2.prototype.isAncestor = function (node) {
          return node.isDescendant(this)
        }
        XMLNode2.prototype.isPreceding = function (node) {
          var nodePos, thisPos
          nodePos = this.treePosition(node)
          thisPos = this.treePosition(this)
          if (nodePos === -1 || thisPos === -1) {
            return false
          } else {
            return nodePos < thisPos
          }
        }
        XMLNode2.prototype.isFollowing = function (node) {
          var nodePos, thisPos
          nodePos = this.treePosition(node)
          thisPos = this.treePosition(this)
          if (nodePos === -1 || thisPos === -1) {
            return false
          } else {
            return nodePos > thisPos
          }
        }
        XMLNode2.prototype.treePosition = function (node) {
          var found, pos
          pos = 0
          found = false
          this.foreachTreeNode(this.document(), function (childNode) {
            pos++
            if (!found && childNode === node) {
              return (found = true)
            }
          })
          if (found) {
            return pos
          } else {
            return -1
          }
        }
        XMLNode2.prototype.foreachTreeNode = function (node, func) {
          var child, j, len, ref2, res
          node || (node = this.document())
          ref2 = node.children
          for (j = 0, len = ref2.length; j < len; j++) {
            child = ref2[j]
            if ((res = func(child))) {
              return res
            } else {
              res = this.foreachTreeNode(child, func)
              if (res) {
                return res
              }
            }
          }
        }
        return XMLNode2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLStringifier.js
var require_XMLStringifier = __commonJS({
  'node_modules/xmlbuilder/lib/XMLStringifier.js'(exports, module) {
    init_define_process()
    ;(function () {
      var XMLStringifier,
        bind = function (fn, me) {
          return function () {
            return fn.apply(me, arguments)
          }
        },
        hasProp = {}.hasOwnProperty
      module.exports = XMLStringifier = (function () {
        function XMLStringifier2(options) {
          this.assertLegalName = bind(this.assertLegalName, this)
          this.assertLegalChar = bind(this.assertLegalChar, this)
          var key, ref, value
          options || (options = {})
          this.options = options
          if (!this.options.version) {
            this.options.version = '1.0'
          }
          ref = options.stringify || {}
          for (key in ref) {
            if (!hasProp.call(ref, key)) continue
            value = ref[key]
            this[key] = value
          }
        }
        XMLStringifier2.prototype.name = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalName('' + val || '')
        }
        XMLStringifier2.prototype.text = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalChar(this.textEscape('' + val || ''))
        }
        XMLStringifier2.prototype.cdata = function (val) {
          if (this.options.noValidation) {
            return val
          }
          val = '' + val || ''
          val = val.replace(']]>', ']]]]><![CDATA[>')
          return this.assertLegalChar(val)
        }
        XMLStringifier2.prototype.comment = function (val) {
          if (this.options.noValidation) {
            return val
          }
          val = '' + val || ''
          if (val.match(/--/)) {
            throw new Error('Comment text cannot contain double-hypen: ' + val)
          }
          return this.assertLegalChar(val)
        }
        XMLStringifier2.prototype.raw = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return '' + val || ''
        }
        XMLStringifier2.prototype.attValue = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalChar(this.attEscape((val = '' + val || '')))
        }
        XMLStringifier2.prototype.insTarget = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalChar('' + val || '')
        }
        XMLStringifier2.prototype.insValue = function (val) {
          if (this.options.noValidation) {
            return val
          }
          val = '' + val || ''
          if (val.match(/\?>/)) {
            throw new Error('Invalid processing instruction value: ' + val)
          }
          return this.assertLegalChar(val)
        }
        XMLStringifier2.prototype.xmlVersion = function (val) {
          if (this.options.noValidation) {
            return val
          }
          val = '' + val || ''
          if (!val.match(/1\.[0-9]+/)) {
            throw new Error('Invalid version number: ' + val)
          }
          return val
        }
        XMLStringifier2.prototype.xmlEncoding = function (val) {
          if (this.options.noValidation) {
            return val
          }
          val = '' + val || ''
          if (!val.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/)) {
            throw new Error('Invalid encoding: ' + val)
          }
          return this.assertLegalChar(val)
        }
        XMLStringifier2.prototype.xmlStandalone = function (val) {
          if (this.options.noValidation) {
            return val
          }
          if (val) {
            return 'yes'
          } else {
            return 'no'
          }
        }
        XMLStringifier2.prototype.dtdPubID = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalChar('' + val || '')
        }
        XMLStringifier2.prototype.dtdSysID = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalChar('' + val || '')
        }
        XMLStringifier2.prototype.dtdElementValue = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalChar('' + val || '')
        }
        XMLStringifier2.prototype.dtdAttType = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalChar('' + val || '')
        }
        XMLStringifier2.prototype.dtdAttDefault = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalChar('' + val || '')
        }
        XMLStringifier2.prototype.dtdEntityValue = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalChar('' + val || '')
        }
        XMLStringifier2.prototype.dtdNData = function (val) {
          if (this.options.noValidation) {
            return val
          }
          return this.assertLegalChar('' + val || '')
        }
        XMLStringifier2.prototype.convertAttKey = '@'
        XMLStringifier2.prototype.convertPIKey = '?'
        XMLStringifier2.prototype.convertTextKey = '#text'
        XMLStringifier2.prototype.convertCDataKey = '#cdata'
        XMLStringifier2.prototype.convertCommentKey = '#comment'
        XMLStringifier2.prototype.convertRawKey = '#raw'
        XMLStringifier2.prototype.assertLegalChar = function (str) {
          var regex, res
          if (this.options.noValidation) {
            return str
          }
          regex = ''
          if (this.options.version === '1.0') {
            regex =
              /[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/
            if ((res = str.match(regex))) {
              throw new Error('Invalid character in string: ' + str + ' at index ' + res.index)
            }
          } else if (this.options.version === '1.1') {
            regex = /[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/
            if ((res = str.match(regex))) {
              throw new Error('Invalid character in string: ' + str + ' at index ' + res.index)
            }
          }
          return str
        }
        XMLStringifier2.prototype.assertLegalName = function (str) {
          var regex
          if (this.options.noValidation) {
            return str
          }
          this.assertLegalChar(str)
          regex =
            /^([:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-:A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/
          if (!str.match(regex)) {
            throw new Error('Invalid character in name')
          }
          return str
        }
        XMLStringifier2.prototype.textEscape = function (str) {
          var ampregex
          if (this.options.noValidation) {
            return str
          }
          ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g
          return str.replace(ampregex, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r/g, '&#xD;')
        }
        XMLStringifier2.prototype.attEscape = function (str) {
          var ampregex
          if (this.options.noValidation) {
            return str
          }
          ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g
          return str
            .replace(ampregex, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;')
            .replace(/\t/g, '&#x9;')
            .replace(/\n/g, '&#xA;')
            .replace(/\r/g, '&#xD;')
        }
        return XMLStringifier2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/WriterState.js
var require_WriterState = __commonJS({
  'node_modules/xmlbuilder/lib/WriterState.js'(exports, module) {
    init_define_process()
    ;(function () {
      module.exports = {
        None: 0,
        OpenTag: 1,
        InsideTag: 2,
        CloseTag: 3,
      }
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLWriterBase.js
var require_XMLWriterBase = __commonJS({
  'node_modules/xmlbuilder/lib/XMLWriterBase.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        WriterState,
        XMLCData,
        XMLComment,
        XMLDTDAttList,
        XMLDTDElement,
        XMLDTDEntity,
        XMLDTDNotation,
        XMLDeclaration,
        XMLDocType,
        XMLDummy,
        XMLElement,
        XMLProcessingInstruction,
        XMLRaw,
        XMLText,
        XMLWriterBase,
        assign,
        hasProp = {}.hasOwnProperty
      assign = require_Utility().assign
      NodeType = require_NodeType()
      XMLDeclaration = require_XMLDeclaration()
      XMLDocType = require_XMLDocType()
      XMLCData = require_XMLCData()
      XMLComment = require_XMLComment()
      XMLElement = require_XMLElement()
      XMLRaw = require_XMLRaw()
      XMLText = require_XMLText()
      XMLProcessingInstruction = require_XMLProcessingInstruction()
      XMLDummy = require_XMLDummy()
      XMLDTDAttList = require_XMLDTDAttList()
      XMLDTDElement = require_XMLDTDElement()
      XMLDTDEntity = require_XMLDTDEntity()
      XMLDTDNotation = require_XMLDTDNotation()
      WriterState = require_WriterState()
      module.exports = XMLWriterBase = (function () {
        function XMLWriterBase2(options) {
          var key, ref, value
          options || (options = {})
          this.options = options
          ref = options.writer || {}
          for (key in ref) {
            if (!hasProp.call(ref, key)) continue
            value = ref[key]
            this['_' + key] = this[key]
            this[key] = value
          }
        }
        XMLWriterBase2.prototype.filterOptions = function (options) {
          var filteredOptions, ref, ref1, ref2, ref3, ref4, ref5, ref6
          options || (options = {})
          options = assign({}, this.options, options)
          filteredOptions = {
            writer: this,
          }
          filteredOptions.pretty = options.pretty || false
          filteredOptions.allowEmpty = options.allowEmpty || false
          filteredOptions.indent = (ref = options.indent) != null ? ref : '  '
          filteredOptions.newline = (ref1 = options.newline) != null ? ref1 : '\n'
          filteredOptions.offset = (ref2 = options.offset) != null ? ref2 : 0
          filteredOptions.dontPrettyTextNodes =
            (ref3 = (ref4 = options.dontPrettyTextNodes) != null ? ref4 : options.dontprettytextnodes) != null
              ? ref3
              : 0
          filteredOptions.spaceBeforeSlash =
            (ref5 = (ref6 = options.spaceBeforeSlash) != null ? ref6 : options.spacebeforeslash) != null ? ref5 : ''
          if (filteredOptions.spaceBeforeSlash === true) {
            filteredOptions.spaceBeforeSlash = ' '
          }
          filteredOptions.suppressPrettyCount = 0
          filteredOptions.user = {}
          filteredOptions.state = WriterState.None
          return filteredOptions
        }
        XMLWriterBase2.prototype.indent = function (node, options, level) {
          var indentLevel
          if (!options.pretty || options.suppressPrettyCount) {
            return ''
          } else if (options.pretty) {
            indentLevel = (level || 0) + options.offset + 1
            if (indentLevel > 0) {
              return new Array(indentLevel).join(options.indent)
            }
          }
          return ''
        }
        XMLWriterBase2.prototype.endline = function (node, options, level) {
          if (!options.pretty || options.suppressPrettyCount) {
            return ''
          } else {
            return options.newline
          }
        }
        XMLWriterBase2.prototype.attribute = function (att, options, level) {
          var r
          this.openAttribute(att, options, level)
          r = ' ' + att.name + '="' + att.value + '"'
          this.closeAttribute(att, options, level)
          return r
        }
        XMLWriterBase2.prototype.cdata = function (node, options, level) {
          var r
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level) + '<![CDATA['
          options.state = WriterState.InsideTag
          r += node.value
          options.state = WriterState.CloseTag
          r += ']]>' + this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.comment = function (node, options, level) {
          var r
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level) + '<!-- '
          options.state = WriterState.InsideTag
          r += node.value
          options.state = WriterState.CloseTag
          r += ' -->' + this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.declaration = function (node, options, level) {
          var r
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level) + '<?xml'
          options.state = WriterState.InsideTag
          r += ' version="' + node.version + '"'
          if (node.encoding != null) {
            r += ' encoding="' + node.encoding + '"'
          }
          if (node.standalone != null) {
            r += ' standalone="' + node.standalone + '"'
          }
          options.state = WriterState.CloseTag
          r += options.spaceBeforeSlash + '?>'
          r += this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.docType = function (node, options, level) {
          var child, i, len, r, ref
          level || (level = 0)
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level)
          r += '<!DOCTYPE ' + node.root().name
          if (node.pubID && node.sysID) {
            r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"'
          } else if (node.sysID) {
            r += ' SYSTEM "' + node.sysID + '"'
          }
          if (node.children.length > 0) {
            r += ' ['
            r += this.endline(node, options, level)
            options.state = WriterState.InsideTag
            ref = node.children
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i]
              r += this.writeChildNode(child, options, level + 1)
            }
            options.state = WriterState.CloseTag
            r += ']'
          }
          options.state = WriterState.CloseTag
          r += options.spaceBeforeSlash + '>'
          r += this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.element = function (node, options, level) {
          var att, child, childNodeCount, firstChildNode, i, j, len, len1, name, prettySuppressed, r, ref, ref1, ref2
          level || (level = 0)
          prettySuppressed = false
          r = ''
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r += this.indent(node, options, level) + '<' + node.name
          ref = node.attribs
          for (name in ref) {
            if (!hasProp.call(ref, name)) continue
            att = ref[name]
            r += this.attribute(att, options, level)
          }
          childNodeCount = node.children.length
          firstChildNode = childNodeCount === 0 ? null : node.children[0]
          if (
            childNodeCount === 0 ||
            node.children.every(function (e) {
              return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === ''
            })
          ) {
            if (options.allowEmpty) {
              r += '>'
              options.state = WriterState.CloseTag
              r += '</' + node.name + '>' + this.endline(node, options, level)
            } else {
              options.state = WriterState.CloseTag
              r += options.spaceBeforeSlash + '/>' + this.endline(node, options, level)
            }
          } else if (
            options.pretty &&
            childNodeCount === 1 &&
            (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) &&
            firstChildNode.value != null
          ) {
            r += '>'
            options.state = WriterState.InsideTag
            options.suppressPrettyCount++
            prettySuppressed = true
            r += this.writeChildNode(firstChildNode, options, level + 1)
            options.suppressPrettyCount--
            prettySuppressed = false
            options.state = WriterState.CloseTag
            r += '</' + node.name + '>' + this.endline(node, options, level)
          } else {
            if (options.dontPrettyTextNodes) {
              ref1 = node.children
              for (i = 0, len = ref1.length; i < len; i++) {
                child = ref1[i]
                if ((child.type === NodeType.Text || child.type === NodeType.Raw) && child.value != null) {
                  options.suppressPrettyCount++
                  prettySuppressed = true
                  break
                }
              }
            }
            r += '>' + this.endline(node, options, level)
            options.state = WriterState.InsideTag
            ref2 = node.children
            for (j = 0, len1 = ref2.length; j < len1; j++) {
              child = ref2[j]
              r += this.writeChildNode(child, options, level + 1)
            }
            options.state = WriterState.CloseTag
            r += this.indent(node, options, level) + '</' + node.name + '>'
            if (prettySuppressed) {
              options.suppressPrettyCount--
            }
            r += this.endline(node, options, level)
            options.state = WriterState.None
          }
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.writeChildNode = function (node, options, level) {
          switch (node.type) {
            case NodeType.CData:
              return this.cdata(node, options, level)
            case NodeType.Comment:
              return this.comment(node, options, level)
            case NodeType.Element:
              return this.element(node, options, level)
            case NodeType.Raw:
              return this.raw(node, options, level)
            case NodeType.Text:
              return this.text(node, options, level)
            case NodeType.ProcessingInstruction:
              return this.processingInstruction(node, options, level)
            case NodeType.Dummy:
              return ''
            case NodeType.Declaration:
              return this.declaration(node, options, level)
            case NodeType.DocType:
              return this.docType(node, options, level)
            case NodeType.AttributeDeclaration:
              return this.dtdAttList(node, options, level)
            case NodeType.ElementDeclaration:
              return this.dtdElement(node, options, level)
            case NodeType.EntityDeclaration:
              return this.dtdEntity(node, options, level)
            case NodeType.NotationDeclaration:
              return this.dtdNotation(node, options, level)
            default:
              throw new Error('Unknown XML node type: ' + node.constructor.name)
          }
        }
        XMLWriterBase2.prototype.processingInstruction = function (node, options, level) {
          var r
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level) + '<?'
          options.state = WriterState.InsideTag
          r += node.target
          if (node.value) {
            r += ' ' + node.value
          }
          options.state = WriterState.CloseTag
          r += options.spaceBeforeSlash + '?>'
          r += this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.raw = function (node, options, level) {
          var r
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level)
          options.state = WriterState.InsideTag
          r += node.value
          options.state = WriterState.CloseTag
          r += this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.text = function (node, options, level) {
          var r
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level)
          options.state = WriterState.InsideTag
          r += node.value
          options.state = WriterState.CloseTag
          r += this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.dtdAttList = function (node, options, level) {
          var r
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level) + '<!ATTLIST'
          options.state = WriterState.InsideTag
          r += ' ' + node.elementName + ' ' + node.attributeName + ' ' + node.attributeType
          if (node.defaultValueType !== '#DEFAULT') {
            r += ' ' + node.defaultValueType
          }
          if (node.defaultValue) {
            r += ' "' + node.defaultValue + '"'
          }
          options.state = WriterState.CloseTag
          r += options.spaceBeforeSlash + '>' + this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.dtdElement = function (node, options, level) {
          var r
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level) + '<!ELEMENT'
          options.state = WriterState.InsideTag
          r += ' ' + node.name + ' ' + node.value
          options.state = WriterState.CloseTag
          r += options.spaceBeforeSlash + '>' + this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.dtdEntity = function (node, options, level) {
          var r
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level) + '<!ENTITY'
          options.state = WriterState.InsideTag
          if (node.pe) {
            r += ' %'
          }
          r += ' ' + node.name
          if (node.value) {
            r += ' "' + node.value + '"'
          } else {
            if (node.pubID && node.sysID) {
              r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"'
            } else if (node.sysID) {
              r += ' SYSTEM "' + node.sysID + '"'
            }
            if (node.nData) {
              r += ' NDATA ' + node.nData
            }
          }
          options.state = WriterState.CloseTag
          r += options.spaceBeforeSlash + '>' + this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.dtdNotation = function (node, options, level) {
          var r
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          r = this.indent(node, options, level) + '<!NOTATION'
          options.state = WriterState.InsideTag
          r += ' ' + node.name
          if (node.pubID && node.sysID) {
            r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"'
          } else if (node.pubID) {
            r += ' PUBLIC "' + node.pubID + '"'
          } else if (node.sysID) {
            r += ' SYSTEM "' + node.sysID + '"'
          }
          options.state = WriterState.CloseTag
          r += options.spaceBeforeSlash + '>' + this.endline(node, options, level)
          options.state = WriterState.None
          this.closeNode(node, options, level)
          return r
        }
        XMLWriterBase2.prototype.openNode = function (node, options, level) {}
        XMLWriterBase2.prototype.closeNode = function (node, options, level) {}
        XMLWriterBase2.prototype.openAttribute = function (att, options, level) {}
        XMLWriterBase2.prototype.closeAttribute = function (att, options, level) {}
        return XMLWriterBase2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLStringWriter.js
var require_XMLStringWriter = __commonJS({
  'node_modules/xmlbuilder/lib/XMLStringWriter.js'(exports, module) {
    init_define_process()
    ;(function () {
      var XMLStringWriter,
        XMLWriterBase,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      XMLWriterBase = require_XMLWriterBase()
      module.exports = XMLStringWriter = (function (superClass) {
        extend(XMLStringWriter2, superClass)
        function XMLStringWriter2(options) {
          XMLStringWriter2.__super__.constructor.call(this, options)
        }
        XMLStringWriter2.prototype.document = function (doc, options) {
          var child, i, len, r, ref
          options = this.filterOptions(options)
          r = ''
          ref = doc.children
          for (i = 0, len = ref.length; i < len; i++) {
            child = ref[i]
            r += this.writeChildNode(child, options, 0)
          }
          if (options.pretty && r.slice(-options.newline.length) === options.newline) {
            r = r.slice(0, -options.newline.length)
          }
          return r
        }
        return XMLStringWriter2
      })(XMLWriterBase)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDocument.js
var require_XMLDocument = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDocument.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        XMLDOMConfiguration,
        XMLDOMImplementation,
        XMLDocument,
        XMLNode,
        XMLStringWriter,
        XMLStringifier,
        isPlainObject,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      isPlainObject = require_Utility().isPlainObject
      XMLDOMImplementation = require_XMLDOMImplementation()
      XMLDOMConfiguration = require_XMLDOMConfiguration()
      XMLNode = require_XMLNode()
      NodeType = require_NodeType()
      XMLStringifier = require_XMLStringifier()
      XMLStringWriter = require_XMLStringWriter()
      module.exports = XMLDocument = (function (superClass) {
        extend(XMLDocument2, superClass)
        function XMLDocument2(options) {
          XMLDocument2.__super__.constructor.call(this, null)
          this.name = '#document'
          this.type = NodeType.Document
          this.documentURI = null
          this.domConfig = new XMLDOMConfiguration()
          options || (options = {})
          if (!options.writer) {
            options.writer = new XMLStringWriter()
          }
          this.options = options
          this.stringify = new XMLStringifier(options)
        }
        Object.defineProperty(XMLDocument2.prototype, 'implementation', {
          value: new XMLDOMImplementation(),
        })
        Object.defineProperty(XMLDocument2.prototype, 'doctype', {
          get: function () {
            var child, i, len, ref
            ref = this.children
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i]
              if (child.type === NodeType.DocType) {
                return child
              }
            }
            return null
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'documentElement', {
          get: function () {
            return this.rootObject || null
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'inputEncoding', {
          get: function () {
            return null
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'strictErrorChecking', {
          get: function () {
            return false
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'xmlEncoding', {
          get: function () {
            if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
              return this.children[0].encoding
            } else {
              return null
            }
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'xmlStandalone', {
          get: function () {
            if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
              return this.children[0].standalone === 'yes'
            } else {
              return false
            }
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'xmlVersion', {
          get: function () {
            if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
              return this.children[0].version
            } else {
              return '1.0'
            }
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'URL', {
          get: function () {
            return this.documentURI
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'origin', {
          get: function () {
            return null
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'compatMode', {
          get: function () {
            return null
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'characterSet', {
          get: function () {
            return null
          },
        })
        Object.defineProperty(XMLDocument2.prototype, 'contentType', {
          get: function () {
            return null
          },
        })
        XMLDocument2.prototype.end = function (writer) {
          var writerOptions
          writerOptions = {}
          if (!writer) {
            writer = this.options.writer
          } else if (isPlainObject(writer)) {
            writerOptions = writer
            writer = this.options.writer
          }
          return writer.document(this, writer.filterOptions(writerOptions))
        }
        XMLDocument2.prototype.toString = function (options) {
          return this.options.writer.document(this, this.options.writer.filterOptions(options))
        }
        XMLDocument2.prototype.createElement = function (tagName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createDocumentFragment = function () {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createTextNode = function (data) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createComment = function (data) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createCDATASection = function (data) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createProcessingInstruction = function (target, data) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createAttribute = function (name) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createEntityReference = function (name) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.getElementsByTagName = function (tagname) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.importNode = function (importedNode, deep) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createElementNS = function (namespaceURI, qualifiedName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createAttributeNS = function (namespaceURI, qualifiedName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.getElementsByTagNameNS = function (namespaceURI, localName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.getElementById = function (elementId) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.adoptNode = function (source) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.normalizeDocument = function () {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.renameNode = function (node, namespaceURI, qualifiedName) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.getElementsByClassName = function (classNames) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createEvent = function (eventInterface) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createRange = function () {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createNodeIterator = function (root, whatToShow, filter) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        XMLDocument2.prototype.createTreeWalker = function (root, whatToShow, filter) {
          throw new Error('This DOM method is not implemented.' + this.debugInfo())
        }
        return XMLDocument2
      })(XMLNode)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLDocumentCB.js
var require_XMLDocumentCB = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDocumentCB.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        WriterState,
        XMLAttribute,
        XMLCData,
        XMLComment,
        XMLDTDAttList,
        XMLDTDElement,
        XMLDTDEntity,
        XMLDTDNotation,
        XMLDeclaration,
        XMLDocType,
        XMLDocument,
        XMLDocumentCB,
        XMLElement,
        XMLProcessingInstruction,
        XMLRaw,
        XMLStringWriter,
        XMLStringifier,
        XMLText,
        getValue,
        isFunction,
        isObject,
        isPlainObject,
        ref,
        hasProp = {}.hasOwnProperty
      ;(ref = require_Utility()),
        (isObject = ref.isObject),
        (isFunction = ref.isFunction),
        (isPlainObject = ref.isPlainObject),
        (getValue = ref.getValue)
      NodeType = require_NodeType()
      XMLDocument = require_XMLDocument()
      XMLElement = require_XMLElement()
      XMLCData = require_XMLCData()
      XMLComment = require_XMLComment()
      XMLRaw = require_XMLRaw()
      XMLText = require_XMLText()
      XMLProcessingInstruction = require_XMLProcessingInstruction()
      XMLDeclaration = require_XMLDeclaration()
      XMLDocType = require_XMLDocType()
      XMLDTDAttList = require_XMLDTDAttList()
      XMLDTDEntity = require_XMLDTDEntity()
      XMLDTDElement = require_XMLDTDElement()
      XMLDTDNotation = require_XMLDTDNotation()
      XMLAttribute = require_XMLAttribute()
      XMLStringifier = require_XMLStringifier()
      XMLStringWriter = require_XMLStringWriter()
      WriterState = require_WriterState()
      module.exports = XMLDocumentCB = (function () {
        function XMLDocumentCB2(options, onData, onEnd) {
          var writerOptions
          this.name = '?xml'
          this.type = NodeType.Document
          options || (options = {})
          writerOptions = {}
          if (!options.writer) {
            options.writer = new XMLStringWriter()
          } else if (isPlainObject(options.writer)) {
            writerOptions = options.writer
            options.writer = new XMLStringWriter()
          }
          this.options = options
          this.writer = options.writer
          this.writerOptions = this.writer.filterOptions(writerOptions)
          this.stringify = new XMLStringifier(options)
          this.onDataCallback = onData || function () {}
          this.onEndCallback = onEnd || function () {}
          this.currentNode = null
          this.currentLevel = -1
          this.openTags = {}
          this.documentStarted = false
          this.documentCompleted = false
          this.root = null
        }
        XMLDocumentCB2.prototype.createChildNode = function (node) {
          var att, attName, attributes, child, i, len, ref1, ref2
          switch (node.type) {
            case NodeType.CData:
              this.cdata(node.value)
              break
            case NodeType.Comment:
              this.comment(node.value)
              break
            case NodeType.Element:
              attributes = {}
              ref1 = node.attribs
              for (attName in ref1) {
                if (!hasProp.call(ref1, attName)) continue
                att = ref1[attName]
                attributes[attName] = att.value
              }
              this.node(node.name, attributes)
              break
            case NodeType.Dummy:
              this.dummy()
              break
            case NodeType.Raw:
              this.raw(node.value)
              break
            case NodeType.Text:
              this.text(node.value)
              break
            case NodeType.ProcessingInstruction:
              this.instruction(node.target, node.value)
              break
            default:
              throw new Error('This XML node type is not supported in a JS object: ' + node.constructor.name)
          }
          ref2 = node.children
          for (i = 0, len = ref2.length; i < len; i++) {
            child = ref2[i]
            this.createChildNode(child)
            if (child.type === NodeType.Element) {
              this.up()
            }
          }
          return this
        }
        XMLDocumentCB2.prototype.dummy = function () {
          return this
        }
        XMLDocumentCB2.prototype.node = function (name, attributes, text) {
          var ref1
          if (name == null) {
            throw new Error('Missing node name.')
          }
          if (this.root && this.currentLevel === -1) {
            throw new Error('Document can only have one root node. ' + this.debugInfo(name))
          }
          this.openCurrent()
          name = getValue(name)
          if (attributes == null) {
            attributes = {}
          }
          attributes = getValue(attributes)
          if (!isObject(attributes)) {
            ;(ref1 = [attributes, text]), (text = ref1[0]), (attributes = ref1[1])
          }
          this.currentNode = new XMLElement(this, name, attributes)
          this.currentNode.children = false
          this.currentLevel++
          this.openTags[this.currentLevel] = this.currentNode
          if (text != null) {
            this.text(text)
          }
          return this
        }
        XMLDocumentCB2.prototype.element = function (name, attributes, text) {
          var child, i, len, oldValidationFlag, ref1, root
          if (this.currentNode && this.currentNode.type === NodeType.DocType) {
            this.dtdElement.apply(this, arguments)
          } else {
            if (Array.isArray(name) || isObject(name) || isFunction(name)) {
              oldValidationFlag = this.options.noValidation
              this.options.noValidation = true
              root = new XMLDocument(this.options).element('TEMP_ROOT')
              root.element(name)
              this.options.noValidation = oldValidationFlag
              ref1 = root.children
              for (i = 0, len = ref1.length; i < len; i++) {
                child = ref1[i]
                this.createChildNode(child)
                if (child.type === NodeType.Element) {
                  this.up()
                }
              }
            } else {
              this.node(name, attributes, text)
            }
          }
          return this
        }
        XMLDocumentCB2.prototype.attribute = function (name, value) {
          var attName, attValue
          if (!this.currentNode || this.currentNode.children) {
            throw new Error(
              'att() can only be used immediately after an ele() call in callback mode. ' + this.debugInfo(name),
            )
          }
          if (name != null) {
            name = getValue(name)
          }
          if (isObject(name)) {
            for (attName in name) {
              if (!hasProp.call(name, attName)) continue
              attValue = name[attName]
              this.attribute(attName, attValue)
            }
          } else {
            if (isFunction(value)) {
              value = value.apply()
            }
            if (this.options.keepNullAttributes && value == null) {
              this.currentNode.attribs[name] = new XMLAttribute(this, name, '')
            } else if (value != null) {
              this.currentNode.attribs[name] = new XMLAttribute(this, name, value)
            }
          }
          return this
        }
        XMLDocumentCB2.prototype.text = function (value) {
          var node
          this.openCurrent()
          node = new XMLText(this, value)
          this.onData(this.writer.text(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1)
          return this
        }
        XMLDocumentCB2.prototype.cdata = function (value) {
          var node
          this.openCurrent()
          node = new XMLCData(this, value)
          this.onData(this.writer.cdata(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1)
          return this
        }
        XMLDocumentCB2.prototype.comment = function (value) {
          var node
          this.openCurrent()
          node = new XMLComment(this, value)
          this.onData(this.writer.comment(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1)
          return this
        }
        XMLDocumentCB2.prototype.raw = function (value) {
          var node
          this.openCurrent()
          node = new XMLRaw(this, value)
          this.onData(this.writer.raw(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1)
          return this
        }
        XMLDocumentCB2.prototype.instruction = function (target, value) {
          var i, insTarget, insValue, len, node
          this.openCurrent()
          if (target != null) {
            target = getValue(target)
          }
          if (value != null) {
            value = getValue(value)
          }
          if (Array.isArray(target)) {
            for (i = 0, len = target.length; i < len; i++) {
              insTarget = target[i]
              this.instruction(insTarget)
            }
          } else if (isObject(target)) {
            for (insTarget in target) {
              if (!hasProp.call(target, insTarget)) continue
              insValue = target[insTarget]
              this.instruction(insTarget, insValue)
            }
          } else {
            if (isFunction(value)) {
              value = value.apply()
            }
            node = new XMLProcessingInstruction(this, target, value)
            this.onData(
              this.writer.processingInstruction(node, this.writerOptions, this.currentLevel + 1),
              this.currentLevel + 1,
            )
          }
          return this
        }
        XMLDocumentCB2.prototype.declaration = function (version, encoding, standalone) {
          var node
          this.openCurrent()
          if (this.documentStarted) {
            throw new Error('declaration() must be the first node.')
          }
          node = new XMLDeclaration(this, version, encoding, standalone)
          this.onData(this.writer.declaration(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1)
          return this
        }
        XMLDocumentCB2.prototype.doctype = function (root, pubID, sysID) {
          this.openCurrent()
          if (root == null) {
            throw new Error('Missing root node name.')
          }
          if (this.root) {
            throw new Error('dtd() must come before the root node.')
          }
          this.currentNode = new XMLDocType(this, pubID, sysID)
          this.currentNode.rootNodeName = root
          this.currentNode.children = false
          this.currentLevel++
          this.openTags[this.currentLevel] = this.currentNode
          return this
        }
        XMLDocumentCB2.prototype.dtdElement = function (name, value) {
          var node
          this.openCurrent()
          node = new XMLDTDElement(this, name, value)
          this.onData(this.writer.dtdElement(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1)
          return this
        }
        XMLDocumentCB2.prototype.attList = function (
          elementName,
          attributeName,
          attributeType,
          defaultValueType,
          defaultValue,
        ) {
          var node
          this.openCurrent()
          node = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue)
          this.onData(this.writer.dtdAttList(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1)
          return this
        }
        XMLDocumentCB2.prototype.entity = function (name, value) {
          var node
          this.openCurrent()
          node = new XMLDTDEntity(this, false, name, value)
          this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1)
          return this
        }
        XMLDocumentCB2.prototype.pEntity = function (name, value) {
          var node
          this.openCurrent()
          node = new XMLDTDEntity(this, true, name, value)
          this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1)
          return this
        }
        XMLDocumentCB2.prototype.notation = function (name, value) {
          var node
          this.openCurrent()
          node = new XMLDTDNotation(this, name, value)
          this.onData(this.writer.dtdNotation(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1)
          return this
        }
        XMLDocumentCB2.prototype.up = function () {
          if (this.currentLevel < 0) {
            throw new Error('The document node has no parent.')
          }
          if (this.currentNode) {
            if (this.currentNode.children) {
              this.closeNode(this.currentNode)
            } else {
              this.openNode(this.currentNode)
            }
            this.currentNode = null
          } else {
            this.closeNode(this.openTags[this.currentLevel])
          }
          delete this.openTags[this.currentLevel]
          this.currentLevel--
          return this
        }
        XMLDocumentCB2.prototype.end = function () {
          while (this.currentLevel >= 0) {
            this.up()
          }
          return this.onEnd()
        }
        XMLDocumentCB2.prototype.openCurrent = function () {
          if (this.currentNode) {
            this.currentNode.children = true
            return this.openNode(this.currentNode)
          }
        }
        XMLDocumentCB2.prototype.openNode = function (node) {
          var att, chunk, name, ref1
          if (!node.isOpen) {
            if (!this.root && this.currentLevel === 0 && node.type === NodeType.Element) {
              this.root = node
            }
            chunk = ''
            if (node.type === NodeType.Element) {
              this.writerOptions.state = WriterState.OpenTag
              chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '<' + node.name
              ref1 = node.attribs
              for (name in ref1) {
                if (!hasProp.call(ref1, name)) continue
                att = ref1[name]
                chunk += this.writer.attribute(att, this.writerOptions, this.currentLevel)
              }
              chunk += (node.children ? '>' : '/>') + this.writer.endline(node, this.writerOptions, this.currentLevel)
              this.writerOptions.state = WriterState.InsideTag
            } else {
              this.writerOptions.state = WriterState.OpenTag
              chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + '<!DOCTYPE ' + node.rootNodeName
              if (node.pubID && node.sysID) {
                chunk += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"'
              } else if (node.sysID) {
                chunk += ' SYSTEM "' + node.sysID + '"'
              }
              if (node.children) {
                chunk += ' ['
                this.writerOptions.state = WriterState.InsideTag
              } else {
                this.writerOptions.state = WriterState.CloseTag
                chunk += '>'
              }
              chunk += this.writer.endline(node, this.writerOptions, this.currentLevel)
            }
            this.onData(chunk, this.currentLevel)
            return (node.isOpen = true)
          }
        }
        XMLDocumentCB2.prototype.closeNode = function (node) {
          var chunk
          if (!node.isClosed) {
            chunk = ''
            this.writerOptions.state = WriterState.CloseTag
            if (node.type === NodeType.Element) {
              chunk =
                this.writer.indent(node, this.writerOptions, this.currentLevel) +
                '</' +
                node.name +
                '>' +
                this.writer.endline(node, this.writerOptions, this.currentLevel)
            } else {
              chunk =
                this.writer.indent(node, this.writerOptions, this.currentLevel) +
                ']>' +
                this.writer.endline(node, this.writerOptions, this.currentLevel)
            }
            this.writerOptions.state = WriterState.None
            this.onData(chunk, this.currentLevel)
            return (node.isClosed = true)
          }
        }
        XMLDocumentCB2.prototype.onData = function (chunk, level) {
          this.documentStarted = true
          return this.onDataCallback(chunk, level + 1)
        }
        XMLDocumentCB2.prototype.onEnd = function () {
          this.documentCompleted = true
          return this.onEndCallback()
        }
        XMLDocumentCB2.prototype.debugInfo = function (name) {
          if (name == null) {
            return ''
          } else {
            return 'node: <' + name + '>'
          }
        }
        XMLDocumentCB2.prototype.ele = function () {
          return this.element.apply(this, arguments)
        }
        XMLDocumentCB2.prototype.nod = function (name, attributes, text) {
          return this.node(name, attributes, text)
        }
        XMLDocumentCB2.prototype.txt = function (value) {
          return this.text(value)
        }
        XMLDocumentCB2.prototype.dat = function (value) {
          return this.cdata(value)
        }
        XMLDocumentCB2.prototype.com = function (value) {
          return this.comment(value)
        }
        XMLDocumentCB2.prototype.ins = function (target, value) {
          return this.instruction(target, value)
        }
        XMLDocumentCB2.prototype.dec = function (version, encoding, standalone) {
          return this.declaration(version, encoding, standalone)
        }
        XMLDocumentCB2.prototype.dtd = function (root, pubID, sysID) {
          return this.doctype(root, pubID, sysID)
        }
        XMLDocumentCB2.prototype.e = function (name, attributes, text) {
          return this.element(name, attributes, text)
        }
        XMLDocumentCB2.prototype.n = function (name, attributes, text) {
          return this.node(name, attributes, text)
        }
        XMLDocumentCB2.prototype.t = function (value) {
          return this.text(value)
        }
        XMLDocumentCB2.prototype.d = function (value) {
          return this.cdata(value)
        }
        XMLDocumentCB2.prototype.c = function (value) {
          return this.comment(value)
        }
        XMLDocumentCB2.prototype.r = function (value) {
          return this.raw(value)
        }
        XMLDocumentCB2.prototype.i = function (target, value) {
          return this.instruction(target, value)
        }
        XMLDocumentCB2.prototype.att = function () {
          if (this.currentNode && this.currentNode.type === NodeType.DocType) {
            return this.attList.apply(this, arguments)
          } else {
            return this.attribute.apply(this, arguments)
          }
        }
        XMLDocumentCB2.prototype.a = function () {
          if (this.currentNode && this.currentNode.type === NodeType.DocType) {
            return this.attList.apply(this, arguments)
          } else {
            return this.attribute.apply(this, arguments)
          }
        }
        XMLDocumentCB2.prototype.ent = function (name, value) {
          return this.entity(name, value)
        }
        XMLDocumentCB2.prototype.pent = function (name, value) {
          return this.pEntity(name, value)
        }
        XMLDocumentCB2.prototype.not = function (name, value) {
          return this.notation(name, value)
        }
        return XMLDocumentCB2
      })()
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/XMLStreamWriter.js
var require_XMLStreamWriter = __commonJS({
  'node_modules/xmlbuilder/lib/XMLStreamWriter.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        WriterState,
        XMLStreamWriter,
        XMLWriterBase,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      NodeType = require_NodeType()
      XMLWriterBase = require_XMLWriterBase()
      WriterState = require_WriterState()
      module.exports = XMLStreamWriter = (function (superClass) {
        extend(XMLStreamWriter2, superClass)
        function XMLStreamWriter2(stream, options) {
          this.stream = stream
          XMLStreamWriter2.__super__.constructor.call(this, options)
        }
        XMLStreamWriter2.prototype.endline = function (node, options, level) {
          if (node.isLastRootNode && options.state === WriterState.CloseTag) {
            return ''
          } else {
            return XMLStreamWriter2.__super__.endline.call(this, node, options, level)
          }
        }
        XMLStreamWriter2.prototype.document = function (doc, options) {
          var child, i, j, k, len, len1, ref, ref1, results
          ref = doc.children
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            child = ref[i]
            child.isLastRootNode = i === doc.children.length - 1
          }
          options = this.filterOptions(options)
          ref1 = doc.children
          results = []
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            child = ref1[k]
            results.push(this.writeChildNode(child, options, 0))
          }
          return results
        }
        XMLStreamWriter2.prototype.attribute = function (att, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.attribute.call(this, att, options, level))
        }
        XMLStreamWriter2.prototype.cdata = function (node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.cdata.call(this, node, options, level))
        }
        XMLStreamWriter2.prototype.comment = function (node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.comment.call(this, node, options, level))
        }
        XMLStreamWriter2.prototype.declaration = function (node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.declaration.call(this, node, options, level))
        }
        XMLStreamWriter2.prototype.docType = function (node, options, level) {
          var child, j, len, ref
          level || (level = 0)
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          this.stream.write(this.indent(node, options, level))
          this.stream.write('<!DOCTYPE ' + node.root().name)
          if (node.pubID && node.sysID) {
            this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"')
          } else if (node.sysID) {
            this.stream.write(' SYSTEM "' + node.sysID + '"')
          }
          if (node.children.length > 0) {
            this.stream.write(' [')
            this.stream.write(this.endline(node, options, level))
            options.state = WriterState.InsideTag
            ref = node.children
            for (j = 0, len = ref.length; j < len; j++) {
              child = ref[j]
              this.writeChildNode(child, options, level + 1)
            }
            options.state = WriterState.CloseTag
            this.stream.write(']')
          }
          options.state = WriterState.CloseTag
          this.stream.write(options.spaceBeforeSlash + '>')
          this.stream.write(this.endline(node, options, level))
          options.state = WriterState.None
          return this.closeNode(node, options, level)
        }
        XMLStreamWriter2.prototype.element = function (node, options, level) {
          var att, child, childNodeCount, firstChildNode, j, len, name, prettySuppressed, ref, ref1
          level || (level = 0)
          this.openNode(node, options, level)
          options.state = WriterState.OpenTag
          this.stream.write(this.indent(node, options, level) + '<' + node.name)
          ref = node.attribs
          for (name in ref) {
            if (!hasProp.call(ref, name)) continue
            att = ref[name]
            this.attribute(att, options, level)
          }
          childNodeCount = node.children.length
          firstChildNode = childNodeCount === 0 ? null : node.children[0]
          if (
            childNodeCount === 0 ||
            node.children.every(function (e) {
              return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === ''
            })
          ) {
            if (options.allowEmpty) {
              this.stream.write('>')
              options.state = WriterState.CloseTag
              this.stream.write('</' + node.name + '>')
            } else {
              options.state = WriterState.CloseTag
              this.stream.write(options.spaceBeforeSlash + '/>')
            }
          } else if (
            options.pretty &&
            childNodeCount === 1 &&
            (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) &&
            firstChildNode.value != null
          ) {
            this.stream.write('>')
            options.state = WriterState.InsideTag
            options.suppressPrettyCount++
            prettySuppressed = true
            this.writeChildNode(firstChildNode, options, level + 1)
            options.suppressPrettyCount--
            prettySuppressed = false
            options.state = WriterState.CloseTag
            this.stream.write('</' + node.name + '>')
          } else {
            this.stream.write('>' + this.endline(node, options, level))
            options.state = WriterState.InsideTag
            ref1 = node.children
            for (j = 0, len = ref1.length; j < len; j++) {
              child = ref1[j]
              this.writeChildNode(child, options, level + 1)
            }
            options.state = WriterState.CloseTag
            this.stream.write(this.indent(node, options, level) + '</' + node.name + '>')
          }
          this.stream.write(this.endline(node, options, level))
          options.state = WriterState.None
          return this.closeNode(node, options, level)
        }
        XMLStreamWriter2.prototype.processingInstruction = function (node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.processingInstruction.call(this, node, options, level))
        }
        XMLStreamWriter2.prototype.raw = function (node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.raw.call(this, node, options, level))
        }
        XMLStreamWriter2.prototype.text = function (node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.text.call(this, node, options, level))
        }
        XMLStreamWriter2.prototype.dtdAttList = function (node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdAttList.call(this, node, options, level))
        }
        XMLStreamWriter2.prototype.dtdElement = function (node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdElement.call(this, node, options, level))
        }
        XMLStreamWriter2.prototype.dtdEntity = function (node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdEntity.call(this, node, options, level))
        }
        XMLStreamWriter2.prototype.dtdNotation = function (node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdNotation.call(this, node, options, level))
        }
        return XMLStreamWriter2
      })(XMLWriterBase)
    }.call(exports))
  },
})

// node_modules/xmlbuilder/lib/index.js
var require_lib = __commonJS({
  'node_modules/xmlbuilder/lib/index.js'(exports, module) {
    init_define_process()
    ;(function () {
      var NodeType,
        WriterState,
        XMLDOMImplementation,
        XMLDocument,
        XMLDocumentCB,
        XMLStreamWriter,
        XMLStringWriter,
        assign,
        isFunction,
        ref
      ;(ref = require_Utility()), (assign = ref.assign), (isFunction = ref.isFunction)
      XMLDOMImplementation = require_XMLDOMImplementation()
      XMLDocument = require_XMLDocument()
      XMLDocumentCB = require_XMLDocumentCB()
      XMLStringWriter = require_XMLStringWriter()
      XMLStreamWriter = require_XMLStreamWriter()
      NodeType = require_NodeType()
      WriterState = require_WriterState()
      module.exports.create = function (name, xmldec, doctype, options) {
        var doc, root
        if (name == null) {
          throw new Error('Root element needs a name.')
        }
        options = assign({}, xmldec, doctype, options)
        doc = new XMLDocument(options)
        root = doc.element(name)
        if (!options.headless) {
          doc.declaration(options)
          if (options.pubID != null || options.sysID != null) {
            doc.dtd(options)
          }
        }
        return root
      }
      module.exports.begin = function (options, onData, onEnd) {
        var ref1
        if (isFunction(options)) {
          ;(ref1 = [options, onData]), (onData = ref1[0]), (onEnd = ref1[1])
          options = {}
        }
        if (onData) {
          return new XMLDocumentCB(options, onData, onEnd)
        } else {
          return new XMLDocument(options)
        }
      }
      module.exports.stringWriter = function (options) {
        return new XMLStringWriter(options)
      }
      module.exports.streamWriter = function (stream, options) {
        return new XMLStreamWriter(stream, options)
      }
      module.exports.implementation = new XMLDOMImplementation()
      module.exports.nodeType = NodeType
      module.exports.writerState = WriterState
    }.call(exports))
  },
})

// node_modules/xml2js/lib/builder.js
var require_builder = __commonJS({
  'node_modules/xml2js/lib/builder.js'(exports) {
    init_define_process()
    ;(function () {
      'use strict'
      var builder,
        defaults,
        escapeCDATA,
        requiresCDATA,
        wrapCDATA,
        hasProp = {}.hasOwnProperty
      builder = require_lib()
      defaults = require_defaults().defaults
      requiresCDATA = function (entry) {
        return (
          typeof entry === 'string' && (entry.indexOf('&') >= 0 || entry.indexOf('>') >= 0 || entry.indexOf('<') >= 0)
        )
      }
      wrapCDATA = function (entry) {
        return '<![CDATA[' + escapeCDATA(entry) + ']]>'
      }
      escapeCDATA = function (entry) {
        return entry.replace(']]>', ']]]]><![CDATA[>')
      }
      exports.Builder = (function () {
        function Builder(opts) {
          var key, ref, value
          this.options = {}
          ref = defaults['0.2']
          for (key in ref) {
            if (!hasProp.call(ref, key)) continue
            value = ref[key]
            this.options[key] = value
          }
          for (key in opts) {
            if (!hasProp.call(opts, key)) continue
            value = opts[key]
            this.options[key] = value
          }
        }
        Builder.prototype.buildObject = function (rootObj) {
          var attrkey, charkey, render, rootElement, rootName
          attrkey = this.options.attrkey
          charkey = this.options.charkey
          if (Object.keys(rootObj).length === 1 && this.options.rootName === defaults['0.2'].rootName) {
            rootName = Object.keys(rootObj)[0]
            rootObj = rootObj[rootName]
          } else {
            rootName = this.options.rootName
          }
          render = (function (_this) {
            return function (element, obj) {
              var attr, child, entry, index, key, value
              if (typeof obj !== 'object') {
                if (_this.options.cdata && requiresCDATA(obj)) {
                  element.raw(wrapCDATA(obj))
                } else {
                  element.txt(obj)
                }
              } else if (Array.isArray(obj)) {
                for (index in obj) {
                  if (!hasProp.call(obj, index)) continue
                  child = obj[index]
                  for (key in child) {
                    entry = child[key]
                    element = render(element.ele(key), entry).up()
                  }
                }
              } else {
                for (key in obj) {
                  if (!hasProp.call(obj, key)) continue
                  child = obj[key]
                  if (key === attrkey) {
                    if (typeof child === 'object') {
                      for (attr in child) {
                        value = child[attr]
                        element = element.att(attr, value)
                      }
                    }
                  } else if (key === charkey) {
                    if (_this.options.cdata && requiresCDATA(child)) {
                      element = element.raw(wrapCDATA(child))
                    } else {
                      element = element.txt(child)
                    }
                  } else if (Array.isArray(child)) {
                    for (index in child) {
                      if (!hasProp.call(child, index)) continue
                      entry = child[index]
                      if (typeof entry === 'string') {
                        if (_this.options.cdata && requiresCDATA(entry)) {
                          element = element.ele(key).raw(wrapCDATA(entry)).up()
                        } else {
                          element = element.ele(key, entry).up()
                        }
                      } else {
                        element = render(element.ele(key), entry).up()
                      }
                    }
                  } else if (typeof child === 'object') {
                    element = render(element.ele(key), child).up()
                  } else {
                    if (typeof child === 'string' && _this.options.cdata && requiresCDATA(child)) {
                      element = element.ele(key).raw(wrapCDATA(child)).up()
                    } else {
                      if (child == null) {
                        child = ''
                      }
                      element = element.ele(key, child.toString()).up()
                    }
                  }
                }
              }
              return element
            }
          })(this)
          rootElement = builder.create(rootName, this.options.xmldec, this.options.doctype, {
            headless: this.options.headless,
            allowSurrogateChars: this.options.allowSurrogateChars,
          })
          return render(rootElement, rootObj).end(this.options.renderOpts)
        }
        return Builder
      })()
    }.call(exports))
  },
})

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  'node_modules/base64-js/index.js'(exports) {
    'use strict'
    init_define_process()
    exports.byteLength = byteLength
    exports.toByteArray = toByteArray
    exports.fromByteArray = fromByteArray
    var lookup = []
    var revLookup = []
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i]
      revLookup[code.charCodeAt(i)] = i
    }
    var i
    var len
    revLookup['-'.charCodeAt(0)] = 62
    revLookup['_'.charCodeAt(0)] = 63
    function getLens(b64) {
      var len2 = b64.length
      if (len2 % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }
      var validLen = b64.indexOf('=')
      if (validLen === -1) validLen = len2
      var placeHoldersLen = validLen === len2 ? 0 : 4 - (validLen % 4)
      return [validLen, placeHoldersLen]
    }
    function byteLength(b64) {
      var lens = getLens(b64)
      var validLen = lens[0]
      var placeHoldersLen = lens[1]
      return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen
    }
    function toByteArray(b64) {
      var tmp
      var lens = getLens(b64)
      var validLen = lens[0]
      var placeHoldersLen = lens[1]
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))
      var curByte = 0
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen
      var i2
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp =
          (revLookup[b64.charCodeAt(i2)] << 18) |
          (revLookup[b64.charCodeAt(i2 + 1)] << 12) |
          (revLookup[b64.charCodeAt(i2 + 2)] << 6) |
          revLookup[b64.charCodeAt(i2 + 3)]
        arr[curByte++] = (tmp >> 16) & 255
        arr[curByte++] = (tmp >> 8) & 255
        arr[curByte++] = tmp & 255
      }
      if (placeHoldersLen === 2) {
        tmp = (revLookup[b64.charCodeAt(i2)] << 2) | (revLookup[b64.charCodeAt(i2 + 1)] >> 4)
        arr[curByte++] = tmp & 255
      }
      if (placeHoldersLen === 1) {
        tmp =
          (revLookup[b64.charCodeAt(i2)] << 10) |
          (revLookup[b64.charCodeAt(i2 + 1)] << 4) |
          (revLookup[b64.charCodeAt(i2 + 2)] >> 2)
        arr[curByte++] = (tmp >> 8) & 255
        arr[curByte++] = tmp & 255
      }
      return arr
    }
    function tripletToBase64(num) {
      return lookup[(num >> 18) & 63] + lookup[(num >> 12) & 63] + lookup[(num >> 6) & 63] + lookup[num & 63]
    }
    function encodeChunk(uint8, start, end) {
      var tmp
      var output = []
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = ((uint8[i2] << 16) & 16711680) + ((uint8[i2 + 1] << 8) & 65280) + (uint8[i2 + 2] & 255)
        output.push(tripletToBase64(tmp))
      }
      return output.join('')
    }
    function fromByteArray(uint8) {
      var tmp
      var len2 = uint8.length
      var extraBytes = len2 % 3
      var parts = []
      var maxChunkLength = 16383
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength))
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1]
        parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 63] + '==')
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1]
        parts.push(lookup[tmp >> 10] + lookup[(tmp >> 4) & 63] + lookup[(tmp << 2) & 63] + '=')
      }
      return parts.join('')
    }
  },
})

// node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  'node_modules/ieee754/index.js'(exports) {
    init_define_process()
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m
      var eLen = nBytes * 8 - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var nBits = -7
      var i = isLE ? nBytes - 1 : 0
      var d = isLE ? -1 : 1
      var s = buffer[offset + i]
      i += d
      e = s & ((1 << -nBits) - 1)
      s >>= -nBits
      nBits += eLen
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}
      m = e & ((1 << -nBits) - 1)
      e >>= -nBits
      nBits += mLen
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}
      if (e === 0) {
        e = 1 - eBias
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity
      } else {
        m = m + Math.pow(2, mLen)
        e = e - eBias
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }
    exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c
      var eLen = nBytes * 8 - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0
      var i = isLE ? 0 : nBytes - 1
      var d = isLE ? 1 : -1
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
      value = Math.abs(value)
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0
        e = eMax
      } else {
        e = Math.floor(Math.log(value) / Math.LN2)
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--
          c *= 2
        }
        if (e + eBias >= 1) {
          value += rt / c
        } else {
          value += rt * Math.pow(2, 1 - eBias)
        }
        if (value * c >= 2) {
          e++
          c /= 2
        }
        if (e + eBias >= eMax) {
          m = 0
          e = eMax
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen)
          e = e + eBias
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
          e = 0
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {}
      e = (e << mLen) | m
      eLen += mLen
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {}
      buffer[offset + i - d] |= s * 128
    }
  },
})

// node_modules/buffer/index.js
var require_buffer = __commonJS({
  'node_modules/buffer/index.js'(exports) {
    'use strict'
    init_define_process()
    var base64 = require_base64_js()
    var ieee754 = require_ieee754()
    var customInspectSymbol =
      typeof Symbol === 'function' && typeof Symbol['for'] === 'function'
        ? Symbol['for']('nodejs.util.inspect.custom')
        : null
    exports.Buffer = Buffer2
    exports.SlowBuffer = SlowBuffer
    exports.INSPECT_MAX_BYTES = 50
    var K_MAX_LENGTH = 2147483647
    exports.kMaxLength = K_MAX_LENGTH
    Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport()
    if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(
        'This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.',
      )
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1)
        const proto = {
          foo: function () {
            return 42
          },
        }
        Object.setPrototypeOf(proto, Uint8Array.prototype)
        Object.setPrototypeOf(arr, proto)
        return arr.foo() === 42
      } catch (e) {
        return false
      }
    }
    Object.defineProperty(Buffer2.prototype, 'parent', {
      enumerable: true,
      get: function () {
        if (!Buffer2.isBuffer(this)) return void 0
        return this.buffer
      },
    })
    Object.defineProperty(Buffer2.prototype, 'offset', {
      enumerable: true,
      get: function () {
        if (!Buffer2.isBuffer(this)) return void 0
        return this.byteOffset
      },
    })
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"')
      }
      const buf = new Uint8Array(length)
      Object.setPrototypeOf(buf, Buffer2.prototype)
      return buf
    }
    function Buffer2(arg, encodingOrOffset, length) {
      if (typeof arg === 'number') {
        if (typeof encodingOrOffset === 'string') {
          throw new TypeError('The "string" argument must be of type string. Received type number')
        }
        return allocUnsafe(arg)
      }
      return from(arg, encodingOrOffset, length)
    }
    Buffer2.poolSize = 8192
    function from(value, encodingOrOffset, length) {
      if (typeof value === 'string') {
        return fromString(value, encodingOrOffset)
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value)
      }
      if (value == null) {
        throw new TypeError(
          'The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' +
            typeof value,
        )
      }
      if (isInstance(value, ArrayBuffer) || (value && isInstance(value.buffer, ArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length)
      }
      if (
        typeof SharedArrayBuffer !== 'undefined' &&
        (isInstance(value, SharedArrayBuffer) || (value && isInstance(value.buffer, SharedArrayBuffer)))
      ) {
        return fromArrayBuffer(value, encodingOrOffset, length)
      }
      if (typeof value === 'number') {
        throw new TypeError('The "value" argument must not be of type number. Received type number')
      }
      const valueOf = value.valueOf && value.valueOf()
      if (valueOf != null && valueOf !== value) {
        return Buffer2.from(valueOf, encodingOrOffset, length)
      }
      const b = fromObject(value)
      if (b) return b
      if (
        typeof Symbol !== 'undefined' &&
        Symbol.toPrimitive != null &&
        typeof value[Symbol.toPrimitive] === 'function'
      ) {
        return Buffer2.from(value[Symbol.toPrimitive]('string'), encodingOrOffset, length)
      }
      throw new TypeError(
        'The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' +
          typeof value,
      )
    }
    Buffer2.from = function (value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length)
    }
    Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype)
    Object.setPrototypeOf(Buffer2, Uint8Array)
    function assertSize(size) {
      if (typeof size !== 'number') {
        throw new TypeError('"size" argument must be of type number')
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"')
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size)
      if (size <= 0) {
        return createBuffer(size)
      }
      if (fill !== void 0) {
        return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill)
      }
      return createBuffer(size)
    }
    Buffer2.alloc = function (size, fill, encoding) {
      return alloc(size, fill, encoding)
    }
    function allocUnsafe(size) {
      assertSize(size)
      return createBuffer(size < 0 ? 0 : checked(size) | 0)
    }
    Buffer2.allocUnsafe = function (size) {
      return allocUnsafe(size)
    }
    Buffer2.allocUnsafeSlow = function (size) {
      return allocUnsafe(size)
    }
    function fromString(string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8'
      }
      if (!Buffer2.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding)
      }
      const length = byteLength(string, encoding) | 0
      let buf = createBuffer(length)
      const actual = buf.write(string, encoding)
      if (actual !== length) {
        buf = buf.slice(0, actual)
      }
      return buf
    }
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0
      const buf = createBuffer(length)
      for (let i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255
      }
      return buf
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView)
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength)
      }
      return fromArrayLike(arrayView)
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds')
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds')
      }
      let buf
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array)
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset)
      } else {
        buf = new Uint8Array(array, byteOffset, length)
      }
      Object.setPrototypeOf(buf, Buffer2.prototype)
      return buf
    }
    function fromObject(obj) {
      if (Buffer2.isBuffer(obj)) {
        const len = checked(obj.length) | 0
        const buf = createBuffer(len)
        if (buf.length === 0) {
          return buf
        }
        obj.copy(buf, 0, 0, len)
        return buf
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
          return createBuffer(0)
        }
        return fromArrayLike(obj)
      }
      if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data)
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError(
          'Attempt to allocate Buffer larger than maximum size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes',
        )
      }
      return length | 0
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0
      }
      return Buffer2.alloc(+length)
    }
    Buffer2.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer2.prototype
    }
    Buffer2.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array)) a = Buffer2.from(a, a.offset, a.byteLength)
      if (isInstance(b, Uint8Array)) b = Buffer2.from(b, b.offset, b.byteLength)
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array')
      }
      if (a === b) return 0
      let x = a.length
      let y = b.length
      for (let i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i]
          y = b[i]
          break
        }
      }
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }
    Buffer2.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case 'hex':
        case 'utf8':
        case 'utf-8':
        case 'ascii':
        case 'latin1':
        case 'binary':
        case 'base64':
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return true
        default:
          return false
      }
    }
    Buffer2.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
      if (list.length === 0) {
        return Buffer2.alloc(0)
      }
      let i
      if (length === void 0) {
        length = 0
        for (i = 0; i < list.length; ++i) {
          length += list[i].length
        }
      }
      const buffer = Buffer2.allocUnsafe(length)
      let pos = 0
      for (i = 0; i < list.length; ++i) {
        let buf = list[i]
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            if (!Buffer2.isBuffer(buf)) buf = Buffer2.from(buf)
            buf.copy(buffer, pos)
          } else {
            Uint8Array.prototype.set.call(buffer, buf, pos)
          }
        } else if (!Buffer2.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers')
        } else {
          buf.copy(buffer, pos)
        }
        pos += buf.length
      }
      return buffer
    }
    function byteLength(string, encoding) {
      if (Buffer2.isBuffer(string)) {
        return string.length
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength
      }
      if (typeof string !== 'string') {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string,
        )
      }
      const len = string.length
      const mustMatch = arguments.length > 2 && arguments[2] === true
      if (!mustMatch && len === 0) return 0
      let loweredCase = false
      for (;;) {
        switch (encoding) {
          case 'ascii':
          case 'latin1':
          case 'binary':
            return len
          case 'utf8':
          case 'utf-8':
            return utf8ToBytes(string).length
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return len * 2
          case 'hex':
            return len >>> 1
          case 'base64':
            return base64ToBytes(string).length
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length
            }
            encoding = ('' + encoding).toLowerCase()
            loweredCase = true
        }
      }
    }
    Buffer2.byteLength = byteLength
    function slowToString(encoding, start, end) {
      let loweredCase = false
      if (start === void 0 || start < 0) {
        start = 0
      }
      if (start > this.length) {
        return ''
      }
      if (end === void 0 || end > this.length) {
        end = this.length
      }
      if (end <= 0) {
        return ''
      }
      end >>>= 0
      start >>>= 0
      if (end <= start) {
        return ''
      }
      if (!encoding) encoding = 'utf8'
      while (true) {
        switch (encoding) {
          case 'hex':
            return hexSlice(this, start, end)
          case 'utf8':
          case 'utf-8':
            return utf8Slice(this, start, end)
          case 'ascii':
            return asciiSlice(this, start, end)
          case 'latin1':
          case 'binary':
            return latin1Slice(this, start, end)
          case 'base64':
            return base64Slice(this, start, end)
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return utf16leSlice(this, start, end)
          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = (encoding + '').toLowerCase()
            loweredCase = true
        }
      }
    }
    Buffer2.prototype._isBuffer = true
    function swap(b, n, m) {
      const i = b[n]
      b[n] = b[m]
      b[m] = i
    }
    Buffer2.prototype.swap16 = function swap16() {
      const len = this.length
      if (len % 2 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 16-bits')
      }
      for (let i = 0; i < len; i += 2) {
        swap(this, i, i + 1)
      }
      return this
    }
    Buffer2.prototype.swap32 = function swap32() {
      const len = this.length
      if (len % 4 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 32-bits')
      }
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3)
        swap(this, i + 1, i + 2)
      }
      return this
    }
    Buffer2.prototype.swap64 = function swap64() {
      const len = this.length
      if (len % 8 !== 0) {
        throw new RangeError('Buffer size must be a multiple of 64-bits')
      }
      for (let i = 0; i < len; i += 8) {
        swap(this, i, i + 7)
        swap(this, i + 1, i + 6)
        swap(this, i + 2, i + 5)
        swap(this, i + 3, i + 4)
      }
      return this
    }
    Buffer2.prototype.toString = function toString() {
      const length = this.length
      if (length === 0) return ''
      if (arguments.length === 0) return utf8Slice(this, 0, length)
      return slowToString.apply(this, arguments)
    }
    Buffer2.prototype.toLocaleString = Buffer2.prototype.toString
    Buffer2.prototype.equals = function equals(b) {
      if (!Buffer2.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
      if (this === b) return true
      return Buffer2.compare(this, b) === 0
    }
    Buffer2.prototype.inspect = function inspect() {
      let str = ''
      const max = exports.INSPECT_MAX_BYTES
      str = this.toString('hex', 0, max)
        .replace(/(.{2})/g, '$1 ')
        .trim()
      if (this.length > max) str += ' ... '
      return '<Buffer ' + str + '>'
    }
    if (customInspectSymbol) {
      Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect
    }
    Buffer2.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer2.from(target, target.offset, target.byteLength)
      }
      if (!Buffer2.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target,
        )
      }
      if (start === void 0) {
        start = 0
      }
      if (end === void 0) {
        end = target ? target.length : 0
      }
      if (thisStart === void 0) {
        thisStart = 0
      }
      if (thisEnd === void 0) {
        thisEnd = this.length
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError('out of range index')
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0
      }
      if (thisStart >= thisEnd) {
        return -1
      }
      if (start >= end) {
        return 1
      }
      start >>>= 0
      end >>>= 0
      thisStart >>>= 0
      thisEnd >>>= 0
      if (this === target) return 0
      let x = thisEnd - thisStart
      let y = end - start
      const len = Math.min(x, y)
      const thisCopy = this.slice(thisStart, thisEnd)
      const targetCopy = target.slice(start, end)
      for (let i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i]
          y = targetCopy[i]
          break
        }
      }
      if (x < y) return -1
      if (y < x) return 1
      return 0
    }
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0) return -1
      if (typeof byteOffset === 'string') {
        encoding = byteOffset
        byteOffset = 0
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648
      }
      byteOffset = +byteOffset
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1
      }
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset
      if (byteOffset >= buffer.length) {
        if (dir) return -1
        else byteOffset = buffer.length - 1
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0
        else return -1
      }
      if (typeof val === 'string') {
        val = Buffer2.from(val, encoding)
      }
      if (Buffer2.isBuffer(val)) {
        if (val.length === 0) {
          return -1
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
      } else if (typeof val === 'number') {
        val = val & 255
        if (typeof Uint8Array.prototype.indexOf === 'function') {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir)
      }
      throw new TypeError('val must be string, number or Buffer')
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1
      let arrLength = arr.length
      let valLength = val.length
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase()
        if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
          if (arr.length < 2 || val.length < 2) {
            return -1
          }
          indexSize = 2
          arrLength /= 2
          valLength /= 2
          byteOffset /= 2
        }
      }
      function read(buf, i2) {
        if (indexSize === 1) {
          return buf[i2]
        } else {
          return buf.readUInt16BE(i2 * indexSize)
        }
      }
      let i
      if (dir) {
        let foundIndex = -1
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
          } else {
            if (foundIndex !== -1) i -= i - foundIndex
            foundIndex = -1
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
        for (i = byteOffset; i >= 0; i--) {
          let found = true
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false
              break
            }
          }
          if (found) return i
        }
      }
      return -1
    }
    Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1
    }
    Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
    }
    Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
    }
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0
      const remaining = buf.length - offset
      if (!length) {
        length = remaining
      } else {
        length = Number(length)
        if (length > remaining) {
          length = remaining
        }
      }
      const strLen = string.length
      if (length > strLen / 2) {
        length = strLen / 2
      }
      let i
      for (i = 0; i < length; ++i) {
        const parsed = parseInt(string.substr(i * 2, 2), 16)
        if (numberIsNaN(parsed)) return i
        buf[offset + i] = parsed
      }
      return i
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length)
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length)
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
    }
    Buffer2.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = 'utf8'
        length = this.length
        offset = 0
      } else if (length === void 0 && typeof offset === 'string') {
        encoding = offset
        length = this.length
        offset = 0
      } else if (isFinite(offset)) {
        offset = offset >>> 0
        if (isFinite(length)) {
          length = length >>> 0
          if (encoding === void 0) encoding = 'utf8'
        } else {
          encoding = length
          length = void 0
        }
      } else {
        throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported')
      }
      const remaining = this.length - offset
      if (length === void 0 || length > remaining) length = remaining
      if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
        throw new RangeError('Attempt to write outside buffer bounds')
      }
      if (!encoding) encoding = 'utf8'
      let loweredCase = false
      for (;;) {
        switch (encoding) {
          case 'hex':
            return hexWrite(this, string, offset, length)
          case 'utf8':
          case 'utf-8':
            return utf8Write(this, string, offset, length)
          case 'ascii':
          case 'latin1':
          case 'binary':
            return asciiWrite(this, string, offset, length)
          case 'base64':
            return base64Write(this, string, offset, length)
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return ucs2Write(this, string, offset, length)
          default:
            if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
            encoding = ('' + encoding).toLowerCase()
            loweredCase = true
        }
      }
    }
    Buffer2.prototype.toJSON = function toJSON() {
      return {
        type: 'Buffer',
        data: Array.prototype.slice.call(this._arr || this, 0),
      }
    }
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf)
      } else {
        return base64.fromByteArray(buf.slice(start, end))
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end)
      const res = []
      let i = start
      while (i < end) {
        const firstByte = buf[i]
        let codePoint = null
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1
        if (i + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte
              }
              break
            case 2:
              secondByte = buf[i + 1]
              if ((secondByte & 192) === 128) {
                tempCodePoint = ((firstByte & 31) << 6) | (secondByte & 63)
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 3:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = ((firstByte & 15) << 12) | ((secondByte & 63) << 6) | (thirdByte & 63)
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint
                }
              }
              break
            case 4:
              secondByte = buf[i + 1]
              thirdByte = buf[i + 2]
              fourthByte = buf[i + 3]
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint =
                  ((firstByte & 15) << 18) | ((secondByte & 63) << 12) | ((thirdByte & 63) << 6) | (fourthByte & 63)
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533
          bytesPerSequence = 1
        } else if (codePoint > 65535) {
          codePoint -= 65536
          res.push(((codePoint >>> 10) & 1023) | 55296)
          codePoint = 56320 | (codePoint & 1023)
        }
        res.push(codePoint)
        i += bytesPerSequence
      }
      return decodeCodePointsArray(res)
    }
    var MAX_ARGUMENTS_LENGTH = 4096
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints)
      }
      let res = ''
      let i = 0
      while (i < len) {
        res += String.fromCharCode.apply(String, codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH)))
      }
      return res
    }
    function asciiSlice(buf, start, end) {
      let ret = ''
      end = Math.min(buf.length, end)
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127)
      }
      return ret
    }
    function latin1Slice(buf, start, end) {
      let ret = ''
      end = Math.min(buf.length, end)
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i])
      }
      return ret
    }
    function hexSlice(buf, start, end) {
      const len = buf.length
      if (!start || start < 0) start = 0
      if (!end || end < 0 || end > len) end = len
      let out = ''
      for (let i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]]
      }
      return out
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end)
      let res = ''
      for (let i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
      }
      return res
    }
    Buffer2.prototype.slice = function slice(start, end) {
      const len = this.length
      start = ~~start
      end = end === void 0 ? len : ~~end
      if (start < 0) {
        start += len
        if (start < 0) start = 0
      } else if (start > len) {
        start = len
      }
      if (end < 0) {
        end += len
        if (end < 0) end = 0
      } else if (end > len) {
        end = len
      }
      if (end < start) end = start
      const newBuf = this.subarray(start, end)
      Object.setPrototypeOf(newBuf, Buffer2.prototype)
      return newBuf
    }
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint')
      if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
    }
    Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0
      byteLength2 = byteLength2 >>> 0
      if (!noAssert) checkOffset(offset, byteLength2, this.length)
      let val = this[offset]
      let mul = 1
      let i = 0
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul
      }
      return val
    }
    Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0
      byteLength2 = byteLength2 >>> 0
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length)
      }
      let val = this[offset + --byteLength2]
      let mul = 1
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul
      }
      return val
    }
    Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 1, this.length)
      return this[offset]
    }
    Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      return this[offset] | (this[offset + 1] << 8)
    }
    Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      return (this[offset] << 8) | this[offset + 1]
    }
    Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return (this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16)) + this[offset + 3] * 16777216
    }
    Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return this[offset] * 16777216 + ((this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3])
    }
    Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
      offset = offset >>> 0
      validateNumber(offset, 'offset')
      const first = this[offset]
      const last = this[offset + 7]
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8)
      }
      const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24
      const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24
      return BigInt(lo) + (BigInt(hi) << BigInt(32))
    })
    Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
      offset = offset >>> 0
      validateNumber(offset, 'offset')
      const first = this[offset]
      const last = this[offset + 7]
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8)
      }
      const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset]
      const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last
      return (BigInt(hi) << BigInt(32)) + BigInt(lo)
    })
    Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0
      byteLength2 = byteLength2 >>> 0
      if (!noAssert) checkOffset(offset, byteLength2, this.length)
      let val = this[offset]
      let mul = 1
      let i = 0
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul
      }
      mul *= 128
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2)
      return val
    }
    Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0
      byteLength2 = byteLength2 >>> 0
      if (!noAssert) checkOffset(offset, byteLength2, this.length)
      let i = byteLength2
      let mul = 1
      let val = this[offset + --i]
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul
      }
      mul *= 128
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2)
      return val
    }
    Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 1, this.length)
      if (!(this[offset] & 128)) return this[offset]
      return (255 - this[offset] + 1) * -1
    }
    Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      const val = this[offset] | (this[offset + 1] << 8)
      return val & 32768 ? val | 4294901760 : val
    }
    Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 2, this.length)
      const val = this[offset + 1] | (this[offset] << 8)
      return val & 32768 ? val | 4294901760 : val
    }
    Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (this[offset + 3] << 24)
    }
    Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return (this[offset] << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3]
    }
    Buffer2.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
      offset = offset >>> 0
      validateNumber(offset, 'offset')
      const first = this[offset]
      const last = this[offset + 7]
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8)
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24)
      return (
        (BigInt(val) << BigInt(32)) +
        BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24)
      )
    })
    Buffer2.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
      offset = offset >>> 0
      validateNumber(offset, 'offset')
      const first = this[offset]
      const last = this[offset + 7]
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8)
      }
      const val = (first << 24) + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset]
      return (
        (BigInt(val) << BigInt(32)) +
        BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last)
      )
    })
    Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, true, 23, 4)
    }
    Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 4, this.length)
      return ieee754.read(this, offset, false, 23, 4)
    }
    Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, true, 52, 8)
    }
    Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0
      if (!noAssert) checkOffset(offset, 8, this.length)
      return ieee754.read(this, offset, false, 52, 8)
    }
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer2.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
    }
    Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(
      value,
      offset,
      byteLength2,
      noAssert,
    ) {
      value = +value
      offset = offset >>> 0
      byteLength2 = byteLength2 >>> 0
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1
        checkInt(this, value, offset, byteLength2, maxBytes, 0)
      }
      let mul = 1
      let i = 0
      this[offset] = value & 255
      while (++i < byteLength2 && (mul *= 256)) {
        this[offset + i] = (value / mul) & 255
      }
      return offset + byteLength2
    }
    Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(
      value,
      offset,
      byteLength2,
      noAssert,
    ) {
      value = +value
      offset = offset >>> 0
      byteLength2 = byteLength2 >>> 0
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1
        checkInt(this, value, offset, byteLength2, maxBytes, 0)
      }
      let i = byteLength2 - 1
      let mul = 1
      this[offset + i] = value & 255
      while (--i >= 0 && (mul *= 256)) {
        this[offset + i] = (value / mul) & 255
      }
      return offset + byteLength2
    }
    Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 1, 255, 0)
      this[offset] = value & 255
      return offset + 1
    }
    Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(
      value,
      offset,
      noAssert,
    ) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0)
      this[offset] = value & 255
      this[offset + 1] = value >>> 8
      return offset + 2
    }
    Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(
      value,
      offset,
      noAssert,
    ) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0)
      this[offset] = value >>> 8
      this[offset + 1] = value & 255
      return offset + 2
    }
    Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(
      value,
      offset,
      noAssert,
    ) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0)
      this[offset + 3] = value >>> 24
      this[offset + 2] = value >>> 16
      this[offset + 1] = value >>> 8
      this[offset] = value & 255
      return offset + 4
    }
    Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(
      value,
      offset,
      noAssert,
    ) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0)
      this[offset] = value >>> 24
      this[offset + 1] = value >>> 16
      this[offset + 2] = value >>> 8
      this[offset + 3] = value & 255
      return offset + 4
    }
    function wrtBigUInt64LE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7)
      let lo = Number(value & BigInt(4294967295))
      buf[offset++] = lo
      lo = lo >> 8
      buf[offset++] = lo
      lo = lo >> 8
      buf[offset++] = lo
      lo = lo >> 8
      buf[offset++] = lo
      let hi = Number((value >> BigInt(32)) & BigInt(4294967295))
      buf[offset++] = hi
      hi = hi >> 8
      buf[offset++] = hi
      hi = hi >> 8
      buf[offset++] = hi
      hi = hi >> 8
      buf[offset++] = hi
      return offset
    }
    function wrtBigUInt64BE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7)
      let lo = Number(value & BigInt(4294967295))
      buf[offset + 7] = lo
      lo = lo >> 8
      buf[offset + 6] = lo
      lo = lo >> 8
      buf[offset + 5] = lo
      lo = lo >> 8
      buf[offset + 4] = lo
      let hi = Number((value >> BigInt(32)) & BigInt(4294967295))
      buf[offset + 3] = hi
      hi = hi >> 8
      buf[offset + 2] = hi
      hi = hi >> 8
      buf[offset + 1] = hi
      hi = hi >> 8
      buf[offset] = hi
      return offset + 8
    }
    Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
    })
    Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt('0xffffffffffffffff'))
    })
    Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1)
        checkInt(this, value, offset, byteLength2, limit - 1, -limit)
      }
      let i = 0
      let mul = 1
      let sub = 0
      this[offset] = value & 255
      while (++i < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1
        }
        this[offset + i] = (((value / mul) >> 0) - sub) & 255
      }
      return offset + byteLength2
    }
    Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1)
        checkInt(this, value, offset, byteLength2, limit - 1, -limit)
      }
      let i = byteLength2 - 1
      let mul = 1
      let sub = 0
      this[offset + i] = value & 255
      while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1
        }
        this[offset + i] = (((value / mul) >> 0) - sub) & 255
      }
      return offset + byteLength2
    }
    Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 1, 127, -128)
      if (value < 0) value = 255 + value + 1
      this[offset] = value & 255
      return offset + 1
    }
    Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768)
      this[offset] = value & 255
      this[offset + 1] = value >>> 8
      return offset + 2
    }
    Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768)
      this[offset] = value >>> 8
      this[offset + 1] = value & 255
      return offset + 2
    }
    Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648)
      this[offset] = value & 255
      this[offset + 1] = value >>> 8
      this[offset + 2] = value >>> 16
      this[offset + 3] = value >>> 24
      return offset + 4
    }
    Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648)
      if (value < 0) value = 4294967295 + value + 1
      this[offset] = value >>> 24
      this[offset + 1] = value >>> 16
      this[offset + 2] = value >>> 8
      this[offset + 3] = value & 255
      return offset + 4
    }
    Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
    })
    Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, -BigInt('0x8000000000000000'), BigInt('0x7fffffffffffffff'))
    })
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError('Index out of range')
      if (offset < 0) throw new RangeError('Index out of range')
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22)
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4)
      return offset + 4
    }
    Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert)
    }
    Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert)
    }
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value
      offset = offset >>> 0
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292)
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8)
      return offset + 8
    }
    Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert)
    }
    Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert)
    }
    Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer2.isBuffer(target)) throw new TypeError('argument should be a Buffer')
      if (!start) start = 0
      if (!end && end !== 0) end = this.length
      if (targetStart >= target.length) targetStart = target.length
      if (!targetStart) targetStart = 0
      if (end > 0 && end < start) end = start
      if (end === start) return 0
      if (target.length === 0 || this.length === 0) return 0
      if (targetStart < 0) {
        throw new RangeError('targetStart out of bounds')
      }
      if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
      if (end < 0) throw new RangeError('sourceEnd out of bounds')
      if (end > this.length) end = this.length
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start
      }
      const len = end - start
      if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
        this.copyWithin(targetStart, start, end)
      } else {
        Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart)
      }
      return len
    }
    Buffer2.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === 'string') {
        if (typeof start === 'string') {
          encoding = start
          start = 0
          end = this.length
        } else if (typeof end === 'string') {
          encoding = end
          end = this.length
        }
        if (encoding !== void 0 && typeof encoding !== 'string') {
          throw new TypeError('encoding must be a string')
        }
        if (typeof encoding === 'string' && !Buffer2.isEncoding(encoding)) {
          throw new TypeError('Unknown encoding: ' + encoding)
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0)
          if ((encoding === 'utf8' && code < 128) || encoding === 'latin1') {
            val = code
          }
        }
      } else if (typeof val === 'number') {
        val = val & 255
      } else if (typeof val === 'boolean') {
        val = Number(val)
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError('Out of range index')
      }
      if (end <= start) {
        return this
      }
      start = start >>> 0
      end = end === void 0 ? this.length : end >>> 0
      if (!val) val = 0
      let i
      if (typeof val === 'number') {
        for (i = start; i < end; ++i) {
          this[i] = val
        }
      } else {
        const bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding)
        const len = bytes.length
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"')
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len]
        }
      }
      return this
    }
    var errors = {}
    function E(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super()
          Object.defineProperty(this, 'message', {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true,
          })
          this.name = `${this.name} [${sym}]`
          this.stack
          delete this.name
        }
        get code() {
          return sym
        }
        set code(value) {
          Object.defineProperty(this, 'code', {
            configurable: true,
            enumerable: true,
            value,
            writable: true,
          })
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`
        }
      }
    }
    E(
      'ERR_BUFFER_OUT_OF_BOUNDS',
      function (name) {
        if (name) {
          return `${name} is outside of buffer bounds`
        }
        return 'Attempt to access memory outside buffer bounds'
      },
      RangeError,
    )
    E(
      'ERR_INVALID_ARG_TYPE',
      function (name, actual) {
        return `The "${name}" argument must be of type number. Received type ${typeof actual}`
      },
      TypeError,
    )
    E(
      'ERR_OUT_OF_RANGE',
      function (str, range, input) {
        let msg = `The value of "${str}" is out of range.`
        let received = input
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input))
        } else if (typeof input === 'bigint') {
          received = String(input)
          if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
            received = addNumericalSeparator(received)
          }
          received += 'n'
        }
        msg += ` It must be ${range}. Received ${received}`
        return msg
      },
      RangeError,
    )
    function addNumericalSeparator(val) {
      let res = ''
      let i = val.length
      const start = val[0] === '-' ? 1 : 0
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`
      }
      return `${val.slice(0, i)}${res}`
    }
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, 'offset')
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1))
      }
    }
    function checkIntBI(value, min, max, buf, offset, byteLength2) {
      if (value > max || value < min) {
        const n = typeof min === 'bigint' ? 'n' : ''
        let range
        if (byteLength2 > 3) {
          if (min === 0 || min === BigInt(0)) {
            range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`
          } else {
            range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`
          }
        } else {
          range = `>= ${min}${n} and <= ${max}${n}`
        }
        throw new errors.ERR_OUT_OF_RANGE('value', range, value)
      }
      checkBounds(buf, offset, byteLength2)
    }
    function validateNumber(value, name) {
      if (typeof value !== 'number') {
        throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value)
      }
    }
    function boundsError(value, length, type) {
      if (Math.floor(value) !== value) {
        validateNumber(value, type)
        throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value)
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS()
      }
      throw new errors.ERR_OUT_OF_RANGE(type || 'offset', `>= ${type ? 1 : 0} and <= ${length}`, value)
    }
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g
    function base64clean(str) {
      str = str.split('=')[0]
      str = str.trim().replace(INVALID_BASE64_RE, '')
      if (str.length < 2) return ''
      while (str.length % 4 !== 0) {
        str = str + '='
      }
      return str
    }
    function utf8ToBytes(string, units) {
      units = units || Infinity
      let codePoint
      const length = string.length
      let leadSurrogate = null
      const bytes = []
      for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i)
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189)
              continue
            } else if (i + 1 === length) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189)
              continue
            }
            leadSurrogate = codePoint
            continue
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189)
            leadSurrogate = codePoint
            continue
          }
          codePoint = (((leadSurrogate - 55296) << 10) | (codePoint - 56320)) + 65536
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189)
        }
        leadSurrogate = null
        if (codePoint < 128) {
          if ((units -= 1) < 0) break
          bytes.push(codePoint)
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break
          bytes.push((codePoint >> 6) | 192, (codePoint & 63) | 128)
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break
          bytes.push((codePoint >> 12) | 224, ((codePoint >> 6) & 63) | 128, (codePoint & 63) | 128)
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break
          bytes.push(
            (codePoint >> 18) | 240,
            ((codePoint >> 12) & 63) | 128,
            ((codePoint >> 6) & 63) | 128,
            (codePoint & 63) | 128,
          )
        } else {
          throw new Error('Invalid code point')
        }
      }
      return bytes
    }
    function asciiToBytes(str) {
      const byteArray = []
      for (let i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255)
      }
      return byteArray
    }
    function utf16leToBytes(str, units) {
      let c, hi, lo
      const byteArray = []
      for (let i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break
        c = str.charCodeAt(i)
        hi = c >> 8
        lo = c % 256
        byteArray.push(lo)
        byteArray.push(hi)
      }
      return byteArray
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str))
    }
    function blitBuffer(src, dst, offset, length) {
      let i
      for (i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length) break
        dst[i + offset] = src[i]
      }
      return i
    }
    function isInstance(obj, type) {
      return (
        obj instanceof type ||
        (obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name)
      )
    }
    function numberIsNaN(obj) {
      return obj !== obj
    }
    var hexSliceLookupTable = (function () {
      const alphabet = '0123456789abcdef'
      const table = new Array(256)
      for (let i = 0; i < 16; ++i) {
        const i16 = i * 16
        for (let j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i] + alphabet[j]
        }
      }
      return table
    })()
    function defineBigIntMethod(fn) {
      return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn
    }
    function BufferBigIntNotDefined() {
      throw new Error('BigInt not supported')
    }
  },
})

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  'node_modules/safe-buffer/index.js'(exports, module) {
    init_define_process()
    var buffer = require_buffer()
    var Buffer2 = buffer.Buffer
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key]
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer
    } else {
      copyProps(buffer, exports)
      exports.Buffer = SafeBuffer
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length)
    }
    copyProps(Buffer2, SafeBuffer)
    SafeBuffer.from = function (arg, encodingOrOffset, length) {
      if (typeof arg === 'number') {
        throw new TypeError('Argument must not be a number')
      }
      return Buffer2(arg, encodingOrOffset, length)
    }
    SafeBuffer.alloc = function (size, fill, encoding) {
      if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number')
      }
      var buf = Buffer2(size)
      if (fill !== void 0) {
        if (typeof encoding === 'string') {
          buf.fill(fill, encoding)
        } else {
          buf.fill(fill)
        }
      } else {
        buf.fill(0)
      }
      return buf
    }
    SafeBuffer.allocUnsafe = function (size) {
      if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number')
      }
      return Buffer2(size)
    }
    SafeBuffer.allocUnsafeSlow = function (size) {
      if (typeof size !== 'number') {
        throw new TypeError('Argument must be a number')
      }
      return buffer.SlowBuffer(size)
    }
  },
})

// node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  'node_modules/string_decoder/lib/string_decoder.js'(exports) {
    'use strict'
    init_define_process()
    var Buffer2 = require_safe_buffer().Buffer
    var isEncoding =
      Buffer2.isEncoding ||
      function (encoding) {
        encoding = '' + encoding
        switch (encoding && encoding.toLowerCase()) {
          case 'hex':
          case 'utf8':
          case 'utf-8':
          case 'ascii':
          case 'binary':
          case 'base64':
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
          case 'raw':
            return true
          default:
            return false
        }
      }
    function _normalizeEncoding(enc) {
      if (!enc) return 'utf8'
      var retried
      while (true) {
        switch (enc) {
          case 'utf8':
          case 'utf-8':
            return 'utf8'
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return 'utf16le'
          case 'latin1':
          case 'binary':
            return 'latin1'
          case 'base64':
          case 'ascii':
          case 'hex':
            return enc
          default:
            if (retried) return
            enc = ('' + enc).toLowerCase()
            retried = true
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc)
      if (typeof nenc !== 'string' && (Buffer2.isEncoding === isEncoding || !isEncoding(enc)))
        throw new Error('Unknown encoding: ' + enc)
      return nenc || enc
    }
    exports.StringDecoder = StringDecoder
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding)
      var nb
      switch (this.encoding) {
        case 'utf16le':
          this.text = utf16Text
          this.end = utf16End
          nb = 4
          break
        case 'utf8':
          this.fillLast = utf8FillLast
          nb = 4
          break
        case 'base64':
          this.text = base64Text
          this.end = base64End
          nb = 3
          break
        default:
          this.write = simpleWrite
          this.end = simpleEnd
          return
      }
      this.lastNeed = 0
      this.lastTotal = 0
      this.lastChar = Buffer2.allocUnsafe(nb)
    }
    StringDecoder.prototype.write = function (buf) {
      if (buf.length === 0) return ''
      var r
      var i
      if (this.lastNeed) {
        r = this.fillLast(buf)
        if (r === void 0) return ''
        i = this.lastNeed
        this.lastNeed = 0
      } else {
        i = 0
      }
      if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i)
      return r || ''
    }
    StringDecoder.prototype.end = utf8End
    StringDecoder.prototype.text = utf8Text
    StringDecoder.prototype.fillLast = function (buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed)
        return this.lastChar.toString(this.encoding, 0, this.lastTotal)
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length)
      this.lastNeed -= buf.length
    }
    function utf8CheckByte(byte) {
      if (byte <= 127) return 0
      else if (byte >> 5 === 6) return 2
      else if (byte >> 4 === 14) return 3
      else if (byte >> 3 === 30) return 4
      return byte >> 6 === 2 ? -1 : -2
    }
    function utf8CheckIncomplete(self2, buf, i) {
      var j = buf.length - 1
      if (j < i) return 0
      var nb = utf8CheckByte(buf[j])
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 1
        return nb
      }
      if (--j < i || nb === -2) return 0
      nb = utf8CheckByte(buf[j])
      if (nb >= 0) {
        if (nb > 0) self2.lastNeed = nb - 2
        return nb
      }
      if (--j < i || nb === -2) return 0
      nb = utf8CheckByte(buf[j])
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2) nb = 0
          else self2.lastNeed = nb - 3
        }
        return nb
      }
      return 0
    }
    function utf8CheckExtraBytes(self2, buf, p) {
      if ((buf[0] & 192) !== 128) {
        self2.lastNeed = 0
        return '\uFFFD'
      }
      if (self2.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self2.lastNeed = 1
          return '\uFFFD'
        }
        if (self2.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self2.lastNeed = 2
            return '\uFFFD'
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed
      var r = utf8CheckExtraBytes(this, buf, p)
      if (r !== void 0) return r
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed)
        return this.lastChar.toString(this.encoding, 0, this.lastTotal)
      }
      buf.copy(this.lastChar, p, 0, buf.length)
      this.lastNeed -= buf.length
    }
    function utf8Text(buf, i) {
      var total = utf8CheckIncomplete(this, buf, i)
      if (!this.lastNeed) return buf.toString('utf8', i)
      this.lastTotal = total
      var end = buf.length - (total - this.lastNeed)
      buf.copy(this.lastChar, 0, end)
      return buf.toString('utf8', i, end)
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : ''
      if (this.lastNeed) return r + '\uFFFD'
      return r
    }
    function utf16Text(buf, i) {
      if ((buf.length - i) % 2 === 0) {
        var r = buf.toString('utf16le', i)
        if (r) {
          var c = r.charCodeAt(r.length - 1)
          if (c >= 55296 && c <= 56319) {
            this.lastNeed = 2
            this.lastTotal = 4
            this.lastChar[0] = buf[buf.length - 2]
            this.lastChar[1] = buf[buf.length - 1]
            return r.slice(0, -1)
          }
        }
        return r
      }
      this.lastNeed = 1
      this.lastTotal = 2
      this.lastChar[0] = buf[buf.length - 1]
      return buf.toString('utf16le', i, buf.length - 1)
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : ''
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed
        return r + this.lastChar.toString('utf16le', 0, end)
      }
      return r
    }
    function base64Text(buf, i) {
      var n = (buf.length - i) % 3
      if (n === 0) return buf.toString('base64', i)
      this.lastNeed = 3 - n
      this.lastTotal = 3
      if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1]
      } else {
        this.lastChar[0] = buf[buf.length - 2]
        this.lastChar[1] = buf[buf.length - 1]
      }
      return buf.toString('base64', i, buf.length - n)
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : ''
      if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed)
      return r
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding)
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : ''
    }
  },
})

// node_modules/sax/lib/sax.js
var require_sax = __commonJS({
  'node_modules/sax/lib/sax.js'(exports) {
    init_define_process()
    ;(function (sax) {
      sax.parser = function (strict, opt) {
        return new SAXParser(strict, opt)
      }
      sax.SAXParser = SAXParser
      sax.SAXStream = SAXStream
      sax.createStream = createStream
      sax.MAX_BUFFER_LENGTH = 64 * 1024
      var buffers = [
        'comment',
        'sgmlDecl',
        'textNode',
        'tagName',
        'doctype',
        'procInstName',
        'procInstBody',
        'entity',
        'attribName',
        'attribValue',
        'cdata',
        'script',
      ]
      sax.EVENTS = [
        'text',
        'processinginstruction',
        'sgmldeclaration',
        'doctype',
        'comment',
        'opentagstart',
        'attribute',
        'opentag',
        'closetag',
        'opencdata',
        'cdata',
        'closecdata',
        'error',
        'end',
        'ready',
        'script',
        'opennamespace',
        'closenamespace',
      ]
      function SAXParser(strict, opt) {
        if (!(this instanceof SAXParser)) {
          return new SAXParser(strict, opt)
        }
        var parser = this
        clearBuffers(parser)
        parser.q = parser.c = ''
        parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
        parser.opt = opt || {}
        parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
        parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
        parser.tags = []
        parser.closed = parser.closedRoot = parser.sawRoot = false
        parser.tag = parser.error = null
        parser.strict = !!strict
        parser.noscript = !!(strict || parser.opt.noscript)
        parser.state = S.BEGIN
        parser.strictEntities = parser.opt.strictEntities
        parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
        parser.attribList = []
        if (parser.opt.xmlns) {
          parser.ns = Object.create(rootNS)
        }
        parser.trackPosition = parser.opt.position !== false
        if (parser.trackPosition) {
          parser.position = parser.line = parser.column = 0
        }
        emit(parser, 'onready')
      }
      if (!Object.create) {
        Object.create = function (o) {
          function F() {}
          F.prototype = o
          var newf = new F()
          return newf
        }
      }
      if (!Object.keys) {
        Object.keys = function (o) {
          var a = []
          for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
          return a
        }
      }
      function checkBufferLength(parser) {
        var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
        var maxActual = 0
        for (var i = 0, l = buffers.length; i < l; i++) {
          var len = parser[buffers[i]].length
          if (len > maxAllowed) {
            switch (buffers[i]) {
              case 'textNode':
                closeText(parser)
                break
              case 'cdata':
                emitNode(parser, 'oncdata', parser.cdata)
                parser.cdata = ''
                break
              case 'script':
                emitNode(parser, 'onscript', parser.script)
                parser.script = ''
                break
              default:
                error(parser, 'Max buffer length exceeded: ' + buffers[i])
            }
          }
          maxActual = Math.max(maxActual, len)
        }
        var m = sax.MAX_BUFFER_LENGTH - maxActual
        parser.bufferCheckPosition = m + parser.position
      }
      function clearBuffers(parser) {
        for (var i = 0, l = buffers.length; i < l; i++) {
          parser[buffers[i]] = ''
        }
      }
      function flushBuffers(parser) {
        closeText(parser)
        if (parser.cdata !== '') {
          emitNode(parser, 'oncdata', parser.cdata)
          parser.cdata = ''
        }
        if (parser.script !== '') {
          emitNode(parser, 'onscript', parser.script)
          parser.script = ''
        }
      }
      SAXParser.prototype = {
        end: function () {
          end(this)
        },
        write,
        resume: function () {
          this.error = null
          return this
        },
        close: function () {
          return this.write(null)
        },
        flush: function () {
          flushBuffers(this)
        },
      }
      var Stream
      try {
        Stream = __require('stream').Stream
      } catch (ex) {
        Stream = function () {}
      }
      var streamWraps = sax.EVENTS.filter(function (ev) {
        return ev !== 'error' && ev !== 'end'
      })
      function createStream(strict, opt) {
        return new SAXStream(strict, opt)
      }
      function SAXStream(strict, opt) {
        if (!(this instanceof SAXStream)) {
          return new SAXStream(strict, opt)
        }
        Stream.apply(this)
        this._parser = new SAXParser(strict, opt)
        this.writable = true
        this.readable = true
        var me = this
        this._parser.onend = function () {
          me.emit('end')
        }
        this._parser.onerror = function (er) {
          me.emit('error', er)
          me._parser.error = null
        }
        this._decoder = null
        streamWraps.forEach(function (ev) {
          Object.defineProperty(me, 'on' + ev, {
            get: function () {
              return me._parser['on' + ev]
            },
            set: function (h) {
              if (!h) {
                me.removeAllListeners(ev)
                me._parser['on' + ev] = h
                return h
              }
              me.on(ev, h)
            },
            enumerable: true,
            configurable: false,
          })
        })
      }
      SAXStream.prototype = Object.create(Stream.prototype, {
        constructor: {
          value: SAXStream,
        },
      })
      SAXStream.prototype.write = function (data) {
        if (typeof Buffer === 'function' && typeof Buffer.isBuffer === 'function' && Buffer.isBuffer(data)) {
          if (!this._decoder) {
            var SD = require_string_decoder().StringDecoder
            this._decoder = new SD('utf8')
          }
          data = this._decoder.write(data)
        }
        this._parser.write(data.toString())
        this.emit('data', data)
        return true
      }
      SAXStream.prototype.end = function (chunk) {
        if (chunk && chunk.length) {
          this.write(chunk)
        }
        this._parser.end()
        return true
      }
      SAXStream.prototype.on = function (ev, handler) {
        var me = this
        if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
          me._parser['on' + ev] = function () {
            var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
            args.splice(0, 0, ev)
            me.emit.apply(me, args)
          }
        }
        return Stream.prototype.on.call(me, ev, handler)
      }
      var CDATA = '[CDATA['
      var DOCTYPE = 'DOCTYPE'
      var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
      var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
      var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }
      var nameStart =
        /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
      var nameBody =
        /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/
      var entityStart =
        /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
      var entityBody =
        /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/
      function isWhitespace(c) {
        return c === ' ' || c === '\n' || c === '\r' || c === '	'
      }
      function isQuote(c) {
        return c === '"' || c === "'"
      }
      function isAttribEnd(c) {
        return c === '>' || isWhitespace(c)
      }
      function isMatch(regex, c) {
        return regex.test(c)
      }
      function notMatch(regex, c) {
        return !isMatch(regex, c)
      }
      var S = 0
      sax.STATE = {
        BEGIN: S++,
        BEGIN_WHITESPACE: S++,
        TEXT: S++,
        TEXT_ENTITY: S++,
        OPEN_WAKA: S++,
        SGML_DECL: S++,
        SGML_DECL_QUOTED: S++,
        DOCTYPE: S++,
        DOCTYPE_QUOTED: S++,
        DOCTYPE_DTD: S++,
        DOCTYPE_DTD_QUOTED: S++,
        COMMENT_STARTING: S++,
        COMMENT: S++,
        COMMENT_ENDING: S++,
        COMMENT_ENDED: S++,
        CDATA: S++,
        CDATA_ENDING: S++,
        CDATA_ENDING_2: S++,
        PROC_INST: S++,
        PROC_INST_BODY: S++,
        PROC_INST_ENDING: S++,
        OPEN_TAG: S++,
        OPEN_TAG_SLASH: S++,
        ATTRIB: S++,
        ATTRIB_NAME: S++,
        ATTRIB_NAME_SAW_WHITE: S++,
        ATTRIB_VALUE: S++,
        ATTRIB_VALUE_QUOTED: S++,
        ATTRIB_VALUE_CLOSED: S++,
        ATTRIB_VALUE_UNQUOTED: S++,
        ATTRIB_VALUE_ENTITY_Q: S++,
        ATTRIB_VALUE_ENTITY_U: S++,
        CLOSE_TAG: S++,
        CLOSE_TAG_SAW_WHITE: S++,
        SCRIPT: S++,
        SCRIPT_ENDING: S++,
      }
      sax.XML_ENTITIES = {
        amp: '&',
        gt: '>',
        lt: '<',
        quot: '"',
        apos: "'",
      }
      sax.ENTITIES = {
        amp: '&',
        gt: '>',
        lt: '<',
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830,
      }
      Object.keys(sax.ENTITIES).forEach(function (key) {
        var e = sax.ENTITIES[key]
        var s2 = typeof e === 'number' ? String.fromCharCode(e) : e
        sax.ENTITIES[key] = s2
      })
      for (var s in sax.STATE) {
        sax.STATE[sax.STATE[s]] = s
      }
      S = sax.STATE
      function emit(parser, event, data) {
        parser[event] && parser[event](data)
      }
      function emitNode(parser, nodeType, data) {
        if (parser.textNode) closeText(parser)
        emit(parser, nodeType, data)
      }
      function closeText(parser) {
        parser.textNode = textopts(parser.opt, parser.textNode)
        if (parser.textNode) emit(parser, 'ontext', parser.textNode)
        parser.textNode = ''
      }
      function textopts(opt, text) {
        if (opt.trim) text = text.trim()
        if (opt.normalize) text = text.replace(/\s+/g, ' ')
        return text
      }
      function error(parser, er) {
        closeText(parser)
        if (parser.trackPosition) {
          er += '\nLine: ' + parser.line + '\nColumn: ' + parser.column + '\nChar: ' + parser.c
        }
        er = new Error(er)
        parser.error = er
        emit(parser, 'onerror', er)
        return parser
      }
      function end(parser) {
        if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
        if (parser.state !== S.BEGIN && parser.state !== S.BEGIN_WHITESPACE && parser.state !== S.TEXT) {
          error(parser, 'Unexpected end')
        }
        closeText(parser)
        parser.c = ''
        parser.closed = true
        emit(parser, 'onend')
        SAXParser.call(parser, parser.strict, parser.opt)
        return parser
      }
      function strictFail(parser, message) {
        if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
          throw new Error('bad call to strictFail')
        }
        if (parser.strict) {
          error(parser, message)
        }
      }
      function newTag(parser) {
        if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
        var parent = parser.tags[parser.tags.length - 1] || parser
        var tag = (parser.tag = { name: parser.tagName, attributes: {} })
        if (parser.opt.xmlns) {
          tag.ns = parent.ns
        }
        parser.attribList.length = 0
        emitNode(parser, 'onopentagstart', tag)
      }
      function qname(name, attribute) {
        var i = name.indexOf(':')
        var qualName = i < 0 ? ['', name] : name.split(':')
        var prefix = qualName[0]
        var local = qualName[1]
        if (attribute && name === 'xmlns') {
          prefix = 'xmlns'
          local = ''
        }
        return { prefix, local }
      }
      function attrib(parser) {
        if (!parser.strict) {
          parser.attribName = parser.attribName[parser.looseCase]()
        }
        if (
          parser.attribList.indexOf(parser.attribName) !== -1 ||
          parser.tag.attributes.hasOwnProperty(parser.attribName)
        ) {
          parser.attribName = parser.attribValue = ''
          return
        }
        if (parser.opt.xmlns) {
          var qn = qname(parser.attribName, true)
          var prefix = qn.prefix
          var local = qn.local
          if (prefix === 'xmlns') {
            if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
              strictFail(parser, 'xml: prefix must be bound to ' + XML_NAMESPACE + '\nActual: ' + parser.attribValue)
            } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
              strictFail(
                parser,
                'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\nActual: ' + parser.attribValue,
              )
            } else {
              var tag = parser.tag
              var parent = parser.tags[parser.tags.length - 1] || parser
              if (tag.ns === parent.ns) {
                tag.ns = Object.create(parent.ns)
              }
              tag.ns[local] = parser.attribValue
            }
          }
          parser.attribList.push([parser.attribName, parser.attribValue])
        } else {
          parser.tag.attributes[parser.attribName] = parser.attribValue
          emitNode(parser, 'onattribute', {
            name: parser.attribName,
            value: parser.attribValue,
          })
        }
        parser.attribName = parser.attribValue = ''
      }
      function openTag(parser, selfClosing) {
        if (parser.opt.xmlns) {
          var tag = parser.tag
          var qn = qname(parser.tagName)
          tag.prefix = qn.prefix
          tag.local = qn.local
          tag.uri = tag.ns[qn.prefix] || ''
          if (tag.prefix && !tag.uri) {
            strictFail(parser, 'Unbound namespace prefix: ' + JSON.stringify(parser.tagName))
            tag.uri = qn.prefix
          }
          var parent = parser.tags[parser.tags.length - 1] || parser
          if (tag.ns && parent.ns !== tag.ns) {
            Object.keys(tag.ns).forEach(function (p) {
              emitNode(parser, 'onopennamespace', {
                prefix: p,
                uri: tag.ns[p],
              })
            })
          }
          for (var i = 0, l = parser.attribList.length; i < l; i++) {
            var nv = parser.attribList[i]
            var name = nv[0]
            var value = nv[1]
            var qualName = qname(name, true)
            var prefix = qualName.prefix
            var local = qualName.local
            var uri = prefix === '' ? '' : tag.ns[prefix] || ''
            var a = {
              name,
              value,
              prefix,
              local,
              uri,
            }
            if (prefix && prefix !== 'xmlns' && !uri) {
              strictFail(parser, 'Unbound namespace prefix: ' + JSON.stringify(prefix))
              a.uri = prefix
            }
            parser.tag.attributes[name] = a
            emitNode(parser, 'onattribute', a)
          }
          parser.attribList.length = 0
        }
        parser.tag.isSelfClosing = !!selfClosing
        parser.sawRoot = true
        parser.tags.push(parser.tag)
        emitNode(parser, 'onopentag', parser.tag)
        if (!selfClosing) {
          if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
            parser.state = S.SCRIPT
          } else {
            parser.state = S.TEXT
          }
          parser.tag = null
          parser.tagName = ''
        }
        parser.attribName = parser.attribValue = ''
        parser.attribList.length = 0
      }
      function closeTag(parser) {
        if (!parser.tagName) {
          strictFail(parser, 'Weird empty close tag.')
          parser.textNode += '</>'
          parser.state = S.TEXT
          return
        }
        if (parser.script) {
          if (parser.tagName !== 'script') {
            parser.script += '</' + parser.tagName + '>'
            parser.tagName = ''
            parser.state = S.SCRIPT
            return
          }
          emitNode(parser, 'onscript', parser.script)
          parser.script = ''
        }
        var t = parser.tags.length
        var tagName = parser.tagName
        if (!parser.strict) {
          tagName = tagName[parser.looseCase]()
        }
        var closeTo = tagName
        while (t--) {
          var close = parser.tags[t]
          if (close.name !== closeTo) {
            strictFail(parser, 'Unexpected close tag')
          } else {
            break
          }
        }
        if (t < 0) {
          strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
          parser.textNode += '</' + parser.tagName + '>'
          parser.state = S.TEXT
          return
        }
        parser.tagName = tagName
        var s2 = parser.tags.length
        while (s2-- > t) {
          var tag = (parser.tag = parser.tags.pop())
          parser.tagName = parser.tag.name
          emitNode(parser, 'onclosetag', parser.tagName)
          var x = {}
          for (var i in tag.ns) {
            x[i] = tag.ns[i]
          }
          var parent = parser.tags[parser.tags.length - 1] || parser
          if (parser.opt.xmlns && tag.ns !== parent.ns) {
            Object.keys(tag.ns).forEach(function (p) {
              var n = tag.ns[p]
              emitNode(parser, 'onclosenamespace', { prefix: p, uri: n })
            })
          }
        }
        if (t === 0) parser.closedRoot = true
        parser.tagName = parser.attribValue = parser.attribName = ''
        parser.attribList.length = 0
        parser.state = S.TEXT
      }
      function parseEntity(parser) {
        var entity = parser.entity
        var entityLC = entity.toLowerCase()
        var num
        var numStr = ''
        if (parser.ENTITIES[entity]) {
          return parser.ENTITIES[entity]
        }
        if (parser.ENTITIES[entityLC]) {
          return parser.ENTITIES[entityLC]
        }
        entity = entityLC
        if (entity.charAt(0) === '#') {
          if (entity.charAt(1) === 'x') {
            entity = entity.slice(2)
            num = parseInt(entity, 16)
            numStr = num.toString(16)
          } else {
            entity = entity.slice(1)
            num = parseInt(entity, 10)
            numStr = num.toString(10)
          }
        }
        entity = entity.replace(/^0+/, '')
        if (isNaN(num) || numStr.toLowerCase() !== entity) {
          strictFail(parser, 'Invalid character entity')
          return '&' + parser.entity + ';'
        }
        return String.fromCodePoint(num)
      }
      function beginWhiteSpace(parser, c) {
        if (c === '<') {
          parser.state = S.OPEN_WAKA
          parser.startTagPosition = parser.position
        } else if (!isWhitespace(c)) {
          strictFail(parser, 'Non-whitespace before first tag.')
          parser.textNode = c
          parser.state = S.TEXT
        }
      }
      function charAt(chunk, i) {
        var result = ''
        if (i < chunk.length) {
          result = chunk.charAt(i)
        }
        return result
      }
      function write(chunk) {
        var parser = this
        if (this.error) {
          throw this.error
        }
        if (parser.closed) {
          return error(parser, 'Cannot write after close. Assign an onready handler.')
        }
        if (chunk === null) {
          return end(parser)
        }
        if (typeof chunk === 'object') {
          chunk = chunk.toString()
        }
        var i = 0
        var c = ''
        while (true) {
          c = charAt(chunk, i++)
          parser.c = c
          if (!c) {
            break
          }
          if (parser.trackPosition) {
            parser.position++
            if (c === '\n') {
              parser.line++
              parser.column = 0
            } else {
              parser.column++
            }
          }
          switch (parser.state) {
            case S.BEGIN:
              parser.state = S.BEGIN_WHITESPACE
              if (c === '\uFEFF') {
                continue
              }
              beginWhiteSpace(parser, c)
              continue
            case S.BEGIN_WHITESPACE:
              beginWhiteSpace(parser, c)
              continue
            case S.TEXT:
              if (parser.sawRoot && !parser.closedRoot) {
                var starti = i - 1
                while (c && c !== '<' && c !== '&') {
                  c = charAt(chunk, i++)
                  if (c && parser.trackPosition) {
                    parser.position++
                    if (c === '\n') {
                      parser.line++
                      parser.column = 0
                    } else {
                      parser.column++
                    }
                  }
                }
                parser.textNode += chunk.substring(starti, i - 1)
              }
              if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
                parser.state = S.OPEN_WAKA
                parser.startTagPosition = parser.position
              } else {
                if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
                  strictFail(parser, 'Text data outside of root node.')
                }
                if (c === '&') {
                  parser.state = S.TEXT_ENTITY
                } else {
                  parser.textNode += c
                }
              }
              continue
            case S.SCRIPT:
              if (c === '<') {
                parser.state = S.SCRIPT_ENDING
              } else {
                parser.script += c
              }
              continue
            case S.SCRIPT_ENDING:
              if (c === '/') {
                parser.state = S.CLOSE_TAG
              } else {
                parser.script += '<' + c
                parser.state = S.SCRIPT
              }
              continue
            case S.OPEN_WAKA:
              if (c === '!') {
                parser.state = S.SGML_DECL
                parser.sgmlDecl = ''
              } else if (isWhitespace(c)) {
              } else if (isMatch(nameStart, c)) {
                parser.state = S.OPEN_TAG
                parser.tagName = c
              } else if (c === '/') {
                parser.state = S.CLOSE_TAG
                parser.tagName = ''
              } else if (c === '?') {
                parser.state = S.PROC_INST
                parser.procInstName = parser.procInstBody = ''
              } else {
                strictFail(parser, 'Unencoded <')
                if (parser.startTagPosition + 1 < parser.position) {
                  var pad = parser.position - parser.startTagPosition
                  c = new Array(pad).join(' ') + c
                }
                parser.textNode += '<' + c
                parser.state = S.TEXT
              }
              continue
            case S.SGML_DECL:
              if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
                emitNode(parser, 'onopencdata')
                parser.state = S.CDATA
                parser.sgmlDecl = ''
                parser.cdata = ''
              } else if (parser.sgmlDecl + c === '--') {
                parser.state = S.COMMENT
                parser.comment = ''
                parser.sgmlDecl = ''
              } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
                parser.state = S.DOCTYPE
                if (parser.doctype || parser.sawRoot) {
                  strictFail(parser, 'Inappropriately located doctype declaration')
                }
                parser.doctype = ''
                parser.sgmlDecl = ''
              } else if (c === '>') {
                emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
                parser.sgmlDecl = ''
                parser.state = S.TEXT
              } else if (isQuote(c)) {
                parser.state = S.SGML_DECL_QUOTED
                parser.sgmlDecl += c
              } else {
                parser.sgmlDecl += c
              }
              continue
            case S.SGML_DECL_QUOTED:
              if (c === parser.q) {
                parser.state = S.SGML_DECL
                parser.q = ''
              }
              parser.sgmlDecl += c
              continue
            case S.DOCTYPE:
              if (c === '>') {
                parser.state = S.TEXT
                emitNode(parser, 'ondoctype', parser.doctype)
                parser.doctype = true
              } else {
                parser.doctype += c
                if (c === '[') {
                  parser.state = S.DOCTYPE_DTD
                } else if (isQuote(c)) {
                  parser.state = S.DOCTYPE_QUOTED
                  parser.q = c
                }
              }
              continue
            case S.DOCTYPE_QUOTED:
              parser.doctype += c
              if (c === parser.q) {
                parser.q = ''
                parser.state = S.DOCTYPE
              }
              continue
            case S.DOCTYPE_DTD:
              parser.doctype += c
              if (c === ']') {
                parser.state = S.DOCTYPE
              } else if (isQuote(c)) {
                parser.state = S.DOCTYPE_DTD_QUOTED
                parser.q = c
              }
              continue
            case S.DOCTYPE_DTD_QUOTED:
              parser.doctype += c
              if (c === parser.q) {
                parser.state = S.DOCTYPE_DTD
                parser.q = ''
              }
              continue
            case S.COMMENT:
              if (c === '-') {
                parser.state = S.COMMENT_ENDING
              } else {
                parser.comment += c
              }
              continue
            case S.COMMENT_ENDING:
              if (c === '-') {
                parser.state = S.COMMENT_ENDED
                parser.comment = textopts(parser.opt, parser.comment)
                if (parser.comment) {
                  emitNode(parser, 'oncomment', parser.comment)
                }
                parser.comment = ''
              } else {
                parser.comment += '-' + c
                parser.state = S.COMMENT
              }
              continue
            case S.COMMENT_ENDED:
              if (c !== '>') {
                strictFail(parser, 'Malformed comment')
                parser.comment += '--' + c
                parser.state = S.COMMENT
              } else {
                parser.state = S.TEXT
              }
              continue
            case S.CDATA:
              if (c === ']') {
                parser.state = S.CDATA_ENDING
              } else {
                parser.cdata += c
              }
              continue
            case S.CDATA_ENDING:
              if (c === ']') {
                parser.state = S.CDATA_ENDING_2
              } else {
                parser.cdata += ']' + c
                parser.state = S.CDATA
              }
              continue
            case S.CDATA_ENDING_2:
              if (c === '>') {
                if (parser.cdata) {
                  emitNode(parser, 'oncdata', parser.cdata)
                }
                emitNode(parser, 'onclosecdata')
                parser.cdata = ''
                parser.state = S.TEXT
              } else if (c === ']') {
                parser.cdata += ']'
              } else {
                parser.cdata += ']]' + c
                parser.state = S.CDATA
              }
              continue
            case S.PROC_INST:
              if (c === '?') {
                parser.state = S.PROC_INST_ENDING
              } else if (isWhitespace(c)) {
                parser.state = S.PROC_INST_BODY
              } else {
                parser.procInstName += c
              }
              continue
            case S.PROC_INST_BODY:
              if (!parser.procInstBody && isWhitespace(c)) {
                continue
              } else if (c === '?') {
                parser.state = S.PROC_INST_ENDING
              } else {
                parser.procInstBody += c
              }
              continue
            case S.PROC_INST_ENDING:
              if (c === '>') {
                emitNode(parser, 'onprocessinginstruction', {
                  name: parser.procInstName,
                  body: parser.procInstBody,
                })
                parser.procInstName = parser.procInstBody = ''
                parser.state = S.TEXT
              } else {
                parser.procInstBody += '?' + c
                parser.state = S.PROC_INST_BODY
              }
              continue
            case S.OPEN_TAG:
              if (isMatch(nameBody, c)) {
                parser.tagName += c
              } else {
                newTag(parser)
                if (c === '>') {
                  openTag(parser)
                } else if (c === '/') {
                  parser.state = S.OPEN_TAG_SLASH
                } else {
                  if (!isWhitespace(c)) {
                    strictFail(parser, 'Invalid character in tag name')
                  }
                  parser.state = S.ATTRIB
                }
              }
              continue
            case S.OPEN_TAG_SLASH:
              if (c === '>') {
                openTag(parser, true)
                closeTag(parser)
              } else {
                strictFail(parser, 'Forward-slash in opening tag not followed by >')
                parser.state = S.ATTRIB
              }
              continue
            case S.ATTRIB:
              if (isWhitespace(c)) {
                continue
              } else if (c === '>') {
                openTag(parser)
              } else if (c === '/') {
                parser.state = S.OPEN_TAG_SLASH
              } else if (isMatch(nameStart, c)) {
                parser.attribName = c
                parser.attribValue = ''
                parser.state = S.ATTRIB_NAME
              } else {
                strictFail(parser, 'Invalid attribute name')
              }
              continue
            case S.ATTRIB_NAME:
              if (c === '=') {
                parser.state = S.ATTRIB_VALUE
              } else if (c === '>') {
                strictFail(parser, 'Attribute without value')
                parser.attribValue = parser.attribName
                attrib(parser)
                openTag(parser)
              } else if (isWhitespace(c)) {
                parser.state = S.ATTRIB_NAME_SAW_WHITE
              } else if (isMatch(nameBody, c)) {
                parser.attribName += c
              } else {
                strictFail(parser, 'Invalid attribute name')
              }
              continue
            case S.ATTRIB_NAME_SAW_WHITE:
              if (c === '=') {
                parser.state = S.ATTRIB_VALUE
              } else if (isWhitespace(c)) {
                continue
              } else {
                strictFail(parser, 'Attribute without value')
                parser.tag.attributes[parser.attribName] = ''
                parser.attribValue = ''
                emitNode(parser, 'onattribute', {
                  name: parser.attribName,
                  value: '',
                })
                parser.attribName = ''
                if (c === '>') {
                  openTag(parser)
                } else if (isMatch(nameStart, c)) {
                  parser.attribName = c
                  parser.state = S.ATTRIB_NAME
                } else {
                  strictFail(parser, 'Invalid attribute name')
                  parser.state = S.ATTRIB
                }
              }
              continue
            case S.ATTRIB_VALUE:
              if (isWhitespace(c)) {
                continue
              } else if (isQuote(c)) {
                parser.q = c
                parser.state = S.ATTRIB_VALUE_QUOTED
              } else {
                strictFail(parser, 'Unquoted attribute value')
                parser.state = S.ATTRIB_VALUE_UNQUOTED
                parser.attribValue = c
              }
              continue
            case S.ATTRIB_VALUE_QUOTED:
              if (c !== parser.q) {
                if (c === '&') {
                  parser.state = S.ATTRIB_VALUE_ENTITY_Q
                } else {
                  parser.attribValue += c
                }
                continue
              }
              attrib(parser)
              parser.q = ''
              parser.state = S.ATTRIB_VALUE_CLOSED
              continue
            case S.ATTRIB_VALUE_CLOSED:
              if (isWhitespace(c)) {
                parser.state = S.ATTRIB
              } else if (c === '>') {
                openTag(parser)
              } else if (c === '/') {
                parser.state = S.OPEN_TAG_SLASH
              } else if (isMatch(nameStart, c)) {
                strictFail(parser, 'No whitespace between attributes')
                parser.attribName = c
                parser.attribValue = ''
                parser.state = S.ATTRIB_NAME
              } else {
                strictFail(parser, 'Invalid attribute name')
              }
              continue
            case S.ATTRIB_VALUE_UNQUOTED:
              if (!isAttribEnd(c)) {
                if (c === '&') {
                  parser.state = S.ATTRIB_VALUE_ENTITY_U
                } else {
                  parser.attribValue += c
                }
                continue
              }
              attrib(parser)
              if (c === '>') {
                openTag(parser)
              } else {
                parser.state = S.ATTRIB
              }
              continue
            case S.CLOSE_TAG:
              if (!parser.tagName) {
                if (isWhitespace(c)) {
                  continue
                } else if (notMatch(nameStart, c)) {
                  if (parser.script) {
                    parser.script += '</' + c
                    parser.state = S.SCRIPT
                  } else {
                    strictFail(parser, 'Invalid tagname in closing tag.')
                  }
                } else {
                  parser.tagName = c
                }
              } else if (c === '>') {
                closeTag(parser)
              } else if (isMatch(nameBody, c)) {
                parser.tagName += c
              } else if (parser.script) {
                parser.script += '</' + parser.tagName
                parser.tagName = ''
                parser.state = S.SCRIPT
              } else {
                if (!isWhitespace(c)) {
                  strictFail(parser, 'Invalid tagname in closing tag')
                }
                parser.state = S.CLOSE_TAG_SAW_WHITE
              }
              continue
            case S.CLOSE_TAG_SAW_WHITE:
              if (isWhitespace(c)) {
                continue
              }
              if (c === '>') {
                closeTag(parser)
              } else {
                strictFail(parser, 'Invalid characters in closing tag')
              }
              continue
            case S.TEXT_ENTITY:
            case S.ATTRIB_VALUE_ENTITY_Q:
            case S.ATTRIB_VALUE_ENTITY_U:
              var returnState
              var buffer
              switch (parser.state) {
                case S.TEXT_ENTITY:
                  returnState = S.TEXT
                  buffer = 'textNode'
                  break
                case S.ATTRIB_VALUE_ENTITY_Q:
                  returnState = S.ATTRIB_VALUE_QUOTED
                  buffer = 'attribValue'
                  break
                case S.ATTRIB_VALUE_ENTITY_U:
                  returnState = S.ATTRIB_VALUE_UNQUOTED
                  buffer = 'attribValue'
                  break
              }
              if (c === ';') {
                parser[buffer] += parseEntity(parser)
                parser.entity = ''
                parser.state = returnState
              } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
                parser.entity += c
              } else {
                strictFail(parser, 'Invalid character in entity name')
                parser[buffer] += '&' + parser.entity + c
                parser.entity = ''
                parser.state = returnState
              }
              continue
            default:
              throw new Error(parser, 'Unknown state: ' + parser.state)
          }
        }
        if (parser.position >= parser.bufferCheckPosition) {
          checkBufferLength(parser)
        }
        return parser
      }
      if (!String.fromCodePoint) {
        ;(function () {
          var stringFromCharCode = String.fromCharCode
          var floor = Math.floor
          var fromCodePoint = function () {
            var MAX_SIZE = 16384
            var codeUnits = []
            var highSurrogate
            var lowSurrogate
            var index = -1
            var length = arguments.length
            if (!length) {
              return ''
            }
            var result = ''
            while (++index < length) {
              var codePoint = Number(arguments[index])
              if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || floor(codePoint) !== codePoint) {
                throw RangeError('Invalid code point: ' + codePoint)
              }
              if (codePoint <= 65535) {
                codeUnits.push(codePoint)
              } else {
                codePoint -= 65536
                highSurrogate = (codePoint >> 10) + 55296
                lowSurrogate = (codePoint % 1024) + 56320
                codeUnits.push(highSurrogate, lowSurrogate)
              }
              if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                result += stringFromCharCode.apply(null, codeUnits)
                codeUnits.length = 0
              }
            }
            return result
          }
          if (Object.defineProperty) {
            Object.defineProperty(String, 'fromCodePoint', {
              value: fromCodePoint,
              configurable: true,
              writable: true,
            })
          } else {
            String.fromCodePoint = fromCodePoint
          }
        })()
      }
    })(typeof exports === 'undefined' ? (exports.sax = {}) : exports)
  },
})

// node_modules/events/events.js
var require_events = __commonJS({
  'node_modules/events/events.js'(exports, module) {
    'use strict'
    init_define_process()
    var R = typeof Reflect === 'object' ? Reflect : null
    var ReflectApply =
      R && typeof R.apply === 'function'
        ? R.apply
        : function ReflectApply2(target, receiver, args) {
            return Function.prototype.apply.call(target, receiver, args)
          }
    var ReflectOwnKeys
    if (R && typeof R.ownKeys === 'function') {
      ReflectOwnKeys = R.ownKeys
    } else if (Object.getOwnPropertySymbols) {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target))
      }
    } else {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target)
      }
    }
    function ProcessEmitWarning(warning) {
      if (console && console.warn) console.warn(warning)
    }
    var NumberIsNaN =
      Number.isNaN ||
      function NumberIsNaN2(value) {
        return value !== value
      }
    function EventEmitter() {
      EventEmitter.init.call(this)
    }
    module.exports = EventEmitter
    module.exports.once = once
    EventEmitter.EventEmitter = EventEmitter
    EventEmitter.prototype._events = void 0
    EventEmitter.prototype._eventsCount = 0
    EventEmitter.prototype._maxListeners = void 0
    var defaultMaxListeners = 10
    function checkListener(listener) {
      if (typeof listener !== 'function') {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener)
      }
    }
    Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
      enumerable: true,
      get: function () {
        return defaultMaxListeners
      },
      set: function (arg) {
        if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
          throw new RangeError(
            'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
              arg +
              '.',
          )
        }
        defaultMaxListeners = arg
      },
    })
    EventEmitter.init = function () {
      if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
        this._events = /* @__PURE__ */ Object.create(null)
        this._eventsCount = 0
      }
      this._maxListeners = this._maxListeners || void 0
    }
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.')
      }
      this._maxListeners = n
      return this
    }
    function _getMaxListeners(that) {
      if (that._maxListeners === void 0) return EventEmitter.defaultMaxListeners
      return that._maxListeners
    }
    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return _getMaxListeners(this)
    }
    EventEmitter.prototype.emit = function emit(type) {
      var args = []
      for (var i = 1; i < arguments.length; i++) args.push(arguments[i])
      var doError = type === 'error'
      var events = this._events
      if (events !== void 0) doError = doError && events.error === void 0
      else if (!doError) return false
      if (doError) {
        var er
        if (args.length > 0) er = args[0]
        if (er instanceof Error) {
          throw er
        }
        var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''))
        err.context = er
        throw err
      }
      var handler = events[type]
      if (handler === void 0) return false
      if (typeof handler === 'function') {
        ReflectApply(handler, this, args)
      } else {
        var len = handler.length
        var listeners = arrayClone(handler, len)
        for (var i = 0; i < len; ++i) ReflectApply(listeners[i], this, args)
      }
      return true
    }
    function _addListener(target, type, listener, prepend) {
      var m
      var events
      var existing
      checkListener(listener)
      events = target._events
      if (events === void 0) {
        events = target._events = /* @__PURE__ */ Object.create(null)
        target._eventsCount = 0
      } else {
        if (events.newListener !== void 0) {
          target.emit('newListener', type, listener.listener ? listener.listener : listener)
          events = target._events
        }
        existing = events[type]
      }
      if (existing === void 0) {
        existing = events[type] = listener
        ++target._eventsCount
      } else {
        if (typeof existing === 'function') {
          existing = events[type] = prepend ? [listener, existing] : [existing, listener]
        } else if (prepend) {
          existing.unshift(listener)
        } else {
          existing.push(listener)
        }
        m = _getMaxListeners(target)
        if (m > 0 && existing.length > m && !existing.warned) {
          existing.warned = true
          var w = new Error(
            'Possible EventEmitter memory leak detected. ' +
              existing.length +
              ' ' +
              String(type) +
              ' listeners added. Use emitter.setMaxListeners() to increase limit',
          )
          w.name = 'MaxListenersExceededWarning'
          w.emitter = target
          w.type = type
          w.count = existing.length
          ProcessEmitWarning(w)
        }
      }
      return target
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false)
    }
    EventEmitter.prototype.on = EventEmitter.prototype.addListener
    EventEmitter.prototype.prependListener = function prependListener(type, listener) {
      return _addListener(this, type, listener, true)
    }
    function onceWrapper() {
      if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn)
        this.fired = true
        if (arguments.length === 0) return this.listener.call(this.target)
        return this.listener.apply(this.target, arguments)
      }
    }
    function _onceWrap(target, type, listener) {
      var state = { fired: false, wrapFn: void 0, target, type, listener }
      var wrapped = onceWrapper.bind(state)
      wrapped.listener = listener
      state.wrapFn = wrapped
      return wrapped
    }
    EventEmitter.prototype.once = function once2(type, listener) {
      checkListener(listener)
      this.on(type, _onceWrap(this, type, listener))
      return this
    }
    EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
      checkListener(listener)
      this.prependListener(type, _onceWrap(this, type, listener))
      return this
    }
    EventEmitter.prototype.removeListener = function removeListener(type, listener) {
      var list, events, position, i, originalListener
      checkListener(listener)
      events = this._events
      if (events === void 0) return this
      list = events[type]
      if (list === void 0) return this
      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0) this._events = /* @__PURE__ */ Object.create(null)
        else {
          delete events[type]
          if (events.removeListener) this.emit('removeListener', type, list.listener || listener)
        }
      } else if (typeof list !== 'function') {
        position = -1
        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener
            position = i
            break
          }
        }
        if (position < 0) return this
        if (position === 0) list.shift()
        else {
          spliceOne(list, position)
        }
        if (list.length === 1) events[type] = list[0]
        if (events.removeListener !== void 0) this.emit('removeListener', type, originalListener || listener)
      }
      return this
    }
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
      var listeners, events, i
      events = this._events
      if (events === void 0) return this
      if (events.removeListener === void 0) {
        if (arguments.length === 0) {
          this._events = /* @__PURE__ */ Object.create(null)
          this._eventsCount = 0
        } else if (events[type] !== void 0) {
          if (--this._eventsCount === 0) this._events = /* @__PURE__ */ Object.create(null)
          else delete events[type]
        }
        return this
      }
      if (arguments.length === 0) {
        var keys = Object.keys(events)
        var key
        for (i = 0; i < keys.length; ++i) {
          key = keys[i]
          if (key === 'removeListener') continue
          this.removeAllListeners(key)
        }
        this.removeAllListeners('removeListener')
        this._events = /* @__PURE__ */ Object.create(null)
        this._eventsCount = 0
        return this
      }
      listeners = events[type]
      if (typeof listeners === 'function') {
        this.removeListener(type, listeners)
      } else if (listeners !== void 0) {
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i])
        }
      }
      return this
    }
    function _listeners(target, type, unwrap) {
      var events = target._events
      if (events === void 0) return []
      var evlistener = events[type]
      if (evlistener === void 0) return []
      if (typeof evlistener === 'function') return unwrap ? [evlistener.listener || evlistener] : [evlistener]
      return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length)
    }
    EventEmitter.prototype.listeners = function listeners(type) {
      return _listeners(this, type, true)
    }
    EventEmitter.prototype.rawListeners = function rawListeners(type) {
      return _listeners(this, type, false)
    }
    EventEmitter.listenerCount = function (emitter, type) {
      if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type)
      } else {
        return listenerCount.call(emitter, type)
      }
    }
    EventEmitter.prototype.listenerCount = listenerCount
    function listenerCount(type) {
      var events = this._events
      if (events !== void 0) {
        var evlistener = events[type]
        if (typeof evlistener === 'function') {
          return 1
        } else if (evlistener !== void 0) {
          return evlistener.length
        }
      }
      return 0
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : []
    }
    function arrayClone(arr, n) {
      var copy = new Array(n)
      for (var i = 0; i < n; ++i) copy[i] = arr[i]
      return copy
    }
    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++) list[index] = list[index + 1]
      list.pop()
    }
    function unwrapListeners(arr) {
      var ret = new Array(arr.length)
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i]
      }
      return ret
    }
    function once(emitter, name) {
      return new Promise(function (resolve, reject) {
        function errorListener(err) {
          emitter.removeListener(name, resolver)
          reject(err)
        }
        function resolver() {
          if (typeof emitter.removeListener === 'function') {
            emitter.removeListener('error', errorListener)
          }
          resolve([].slice.call(arguments))
        }
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true })
        if (name !== 'error') {
          addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true })
        }
      })
    }
    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
      if (typeof emitter.on === 'function') {
        eventTargetAgnosticAddListener(emitter, 'error', handler, flags)
      }
    }
    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
      if (typeof emitter.on === 'function') {
        if (flags.once) {
          emitter.once(name, listener)
        } else {
          emitter.on(name, listener)
        }
      } else if (typeof emitter.addEventListener === 'function') {
        emitter.addEventListener(name, function wrapListener(arg) {
          if (flags.once) {
            emitter.removeEventListener(name, wrapListener)
          }
          listener(arg)
        })
      } else {
        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter)
      }
    }
  },
})

// node_modules/xml2js/lib/bom.js
var require_bom = __commonJS({
  'node_modules/xml2js/lib/bom.js'(exports) {
    init_define_process()
    ;(function () {
      'use strict'
      exports.stripBOM = function (str) {
        if (str[0] === '\uFEFF') {
          return str.substring(1)
        } else {
          return str
        }
      }
    }.call(exports))
  },
})

// node_modules/xml2js/lib/processors.js
var require_processors = __commonJS({
  'node_modules/xml2js/lib/processors.js'(exports) {
    init_define_process()
    ;(function () {
      'use strict'
      var prefixMatch
      prefixMatch = new RegExp(/(?!xmlns)^.*:/)
      exports.normalize = function (str) {
        return str.toLowerCase()
      }
      exports.firstCharLowerCase = function (str) {
        return str.charAt(0).toLowerCase() + str.slice(1)
      }
      exports.stripPrefix = function (str) {
        return str.replace(prefixMatch, '')
      }
      exports.parseNumbers = function (str) {
        if (!isNaN(str)) {
          str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str)
        }
        return str
      }
      exports.parseBooleans = function (str) {
        if (/^(?:true|false)$/i.test(str)) {
          str = str.toLowerCase() === 'true'
        }
        return str
      }
    }.call(exports))
  },
})

// globals:timers
var require_timers = __commonJS({
  'globals:timers'(exports, module) {
    init_define_process()
    module.exports = globalThis
  },
})

// node_modules/xml2js/lib/parser.js
var require_parser = __commonJS({
  'node_modules/xml2js/lib/parser.js'(exports) {
    init_define_process()
    ;(function () {
      'use strict'
      var bom,
        defaults,
        events,
        isEmpty,
        processItem,
        processors,
        sax,
        setImmediate,
        bind = function (fn, me) {
          return function () {
            return fn.apply(me, arguments)
          }
        },
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      sax = require_sax()
      events = require_events()
      bom = require_bom()
      processors = require_processors()
      setImmediate = require_timers().setImmediate
      defaults = require_defaults().defaults
      isEmpty = function (thing) {
        return typeof thing === 'object' && thing != null && Object.keys(thing).length === 0
      }
      processItem = function (processors2, item, key) {
        var i, len, process2
        for (i = 0, len = processors2.length; i < len; i++) {
          process2 = processors2[i]
          item = process2(item, key)
        }
        return item
      }
      exports.Parser = (function (superClass) {
        extend(Parser, superClass)
        function Parser(opts) {
          this.parseStringPromise = bind(this.parseStringPromise, this)
          this.parseString = bind(this.parseString, this)
          this.reset = bind(this.reset, this)
          this.assignOrPush = bind(this.assignOrPush, this)
          this.processAsync = bind(this.processAsync, this)
          var key, ref, value
          if (!(this instanceof exports.Parser)) {
            return new exports.Parser(opts)
          }
          this.options = {}
          ref = defaults['0.2']
          for (key in ref) {
            if (!hasProp.call(ref, key)) continue
            value = ref[key]
            this.options[key] = value
          }
          for (key in opts) {
            if (!hasProp.call(opts, key)) continue
            value = opts[key]
            this.options[key] = value
          }
          if (this.options.xmlns) {
            this.options.xmlnskey = this.options.attrkey + 'ns'
          }
          if (this.options.normalizeTags) {
            if (!this.options.tagNameProcessors) {
              this.options.tagNameProcessors = []
            }
            this.options.tagNameProcessors.unshift(processors.normalize)
          }
          this.reset()
        }
        Parser.prototype.processAsync = function () {
          var chunk, err
          try {
            if (this.remaining.length <= this.options.chunkSize) {
              chunk = this.remaining
              this.remaining = ''
              this.saxParser = this.saxParser.write(chunk)
              return this.saxParser.close()
            } else {
              chunk = this.remaining.substr(0, this.options.chunkSize)
              this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length)
              this.saxParser = this.saxParser.write(chunk)
              return setImmediate(this.processAsync)
            }
          } catch (error1) {
            err = error1
            if (!this.saxParser.errThrown) {
              this.saxParser.errThrown = true
              return this.emit(err)
            }
          }
        }
        Parser.prototype.assignOrPush = function (obj, key, newValue) {
          if (!(key in obj)) {
            if (!this.options.explicitArray) {
              return (obj[key] = newValue)
            } else {
              return (obj[key] = [newValue])
            }
          } else {
            if (!(obj[key] instanceof Array)) {
              obj[key] = [obj[key]]
            }
            return obj[key].push(newValue)
          }
        }
        Parser.prototype.reset = function () {
          var attrkey, charkey, ontext, stack
          this.removeAllListeners()
          this.saxParser = sax.parser(this.options.strict, {
            trim: false,
            normalize: false,
            xmlns: this.options.xmlns,
          })
          this.saxParser.errThrown = false
          this.saxParser.onerror = (function (_this) {
            return function (error) {
              _this.saxParser.resume()
              if (!_this.saxParser.errThrown) {
                _this.saxParser.errThrown = true
                return _this.emit('error', error)
              }
            }
          })(this)
          this.saxParser.onend = (function (_this) {
            return function () {
              if (!_this.saxParser.ended) {
                _this.saxParser.ended = true
                return _this.emit('end', _this.resultObject)
              }
            }
          })(this)
          this.saxParser.ended = false
          this.EXPLICIT_CHARKEY = this.options.explicitCharkey
          this.resultObject = null
          stack = []
          attrkey = this.options.attrkey
          charkey = this.options.charkey
          this.saxParser.onopentag = (function (_this) {
            return function (node) {
              var key, newValue, obj, processedKey, ref
              obj = {}
              obj[charkey] = ''
              if (!_this.options.ignoreAttrs) {
                ref = node.attributes
                for (key in ref) {
                  if (!hasProp.call(ref, key)) continue
                  if (!(attrkey in obj) && !_this.options.mergeAttrs) {
                    obj[attrkey] = {}
                  }
                  newValue = _this.options.attrValueProcessors
                    ? processItem(_this.options.attrValueProcessors, node.attributes[key], key)
                    : node.attributes[key]
                  processedKey = _this.options.attrNameProcessors
                    ? processItem(_this.options.attrNameProcessors, key)
                    : key
                  if (_this.options.mergeAttrs) {
                    _this.assignOrPush(obj, processedKey, newValue)
                  } else {
                    obj[attrkey][processedKey] = newValue
                  }
                }
              }
              obj['#name'] = _this.options.tagNameProcessors
                ? processItem(_this.options.tagNameProcessors, node.name)
                : node.name
              if (_this.options.xmlns) {
                obj[_this.options.xmlnskey] = {
                  uri: node.uri,
                  local: node.local,
                }
              }
              return stack.push(obj)
            }
          })(this)
          this.saxParser.onclosetag = (function (_this) {
            return function () {
              var cdata, emptyStr, key, node, nodeName, obj, objClone, old, s, xpath
              obj = stack.pop()
              nodeName = obj['#name']
              if (!_this.options.explicitChildren || !_this.options.preserveChildrenOrder) {
                delete obj['#name']
              }
              if (obj.cdata === true) {
                cdata = obj.cdata
                delete obj.cdata
              }
              s = stack[stack.length - 1]
              if (obj[charkey].match(/^\s*$/) && !cdata) {
                emptyStr = obj[charkey]
                delete obj[charkey]
              } else {
                if (_this.options.trim) {
                  obj[charkey] = obj[charkey].trim()
                }
                if (_this.options.normalize) {
                  obj[charkey] = obj[charkey].replace(/\s{2,}/g, ' ').trim()
                }
                obj[charkey] = _this.options.valueProcessors
                  ? processItem(_this.options.valueProcessors, obj[charkey], nodeName)
                  : obj[charkey]
                if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                  obj = obj[charkey]
                }
              }
              if (isEmpty(obj)) {
                obj = _this.options.emptyTag !== '' ? _this.options.emptyTag : emptyStr
              }
              if (_this.options.validator != null) {
                xpath =
                  '/' +
                  (function () {
                    var i, len, results
                    results = []
                    for (i = 0, len = stack.length; i < len; i++) {
                      node = stack[i]
                      results.push(node['#name'])
                    }
                    return results
                  })()
                    .concat(nodeName)
                    .join('/')
                ;(function () {
                  var err
                  try {
                    return (obj = _this.options.validator(xpath, s && s[nodeName], obj))
                  } catch (error1) {
                    err = error1
                    return _this.emit('error', err)
                  }
                })()
              }
              if (_this.options.explicitChildren && !_this.options.mergeAttrs && typeof obj === 'object') {
                if (!_this.options.preserveChildrenOrder) {
                  node = {}
                  if (_this.options.attrkey in obj) {
                    node[_this.options.attrkey] = obj[_this.options.attrkey]
                    delete obj[_this.options.attrkey]
                  }
                  if (!_this.options.charsAsChildren && _this.options.charkey in obj) {
                    node[_this.options.charkey] = obj[_this.options.charkey]
                    delete obj[_this.options.charkey]
                  }
                  if (Object.getOwnPropertyNames(obj).length > 0) {
                    node[_this.options.childkey] = obj
                  }
                  obj = node
                } else if (s) {
                  s[_this.options.childkey] = s[_this.options.childkey] || []
                  objClone = {}
                  for (key in obj) {
                    if (!hasProp.call(obj, key)) continue
                    objClone[key] = obj[key]
                  }
                  s[_this.options.childkey].push(objClone)
                  delete obj['#name']
                  if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                    obj = obj[charkey]
                  }
                }
              }
              if (stack.length > 0) {
                return _this.assignOrPush(s, nodeName, obj)
              } else {
                if (_this.options.explicitRoot) {
                  old = obj
                  obj = {}
                  obj[nodeName] = old
                }
                _this.resultObject = obj
                _this.saxParser.ended = true
                return _this.emit('end', _this.resultObject)
              }
            }
          })(this)
          ontext = (function (_this) {
            return function (text) {
              var charChild, s
              s = stack[stack.length - 1]
              if (s) {
                s[charkey] += text
                if (
                  _this.options.explicitChildren &&
                  _this.options.preserveChildrenOrder &&
                  _this.options.charsAsChildren &&
                  (_this.options.includeWhiteChars || text.replace(/\\n/g, '').trim() !== '')
                ) {
                  s[_this.options.childkey] = s[_this.options.childkey] || []
                  charChild = {
                    '#name': '__text__',
                  }
                  charChild[charkey] = text
                  if (_this.options.normalize) {
                    charChild[charkey] = charChild[charkey].replace(/\s{2,}/g, ' ').trim()
                  }
                  s[_this.options.childkey].push(charChild)
                }
                return s
              }
            }
          })(this)
          this.saxParser.ontext = ontext
          return (this.saxParser.oncdata = (function (_this) {
            return function (text) {
              var s
              s = ontext(text)
              if (s) {
                return (s.cdata = true)
              }
            }
          })(this))
        }
        Parser.prototype.parseString = function (str, cb) {
          var err
          if (cb != null && typeof cb === 'function') {
            this.on('end', function (result) {
              this.reset()
              return cb(null, result)
            })
            this.on('error', function (err2) {
              this.reset()
              return cb(err2)
            })
          }
          try {
            str = str.toString()
            if (str.trim() === '') {
              this.emit('end', null)
              return true
            }
            str = bom.stripBOM(str)
            if (this.options.async) {
              this.remaining = str
              setImmediate(this.processAsync)
              return this.saxParser
            }
            return this.saxParser.write(str).close()
          } catch (error1) {
            err = error1
            if (!(this.saxParser.errThrown || this.saxParser.ended)) {
              this.emit('error', err)
              return (this.saxParser.errThrown = true)
            } else if (this.saxParser.ended) {
              throw err
            }
          }
        }
        Parser.prototype.parseStringPromise = function (str) {
          return new Promise(
            (function (_this) {
              return function (resolve, reject) {
                return _this.parseString(str, function (err, value) {
                  if (err) {
                    return reject(err)
                  } else {
                    return resolve(value)
                  }
                })
              }
            })(this),
          )
        }
        return Parser
      })(events)
      exports.parseString = function (str, a, b) {
        var cb, options, parser
        if (b != null) {
          if (typeof b === 'function') {
            cb = b
          }
          if (typeof a === 'object') {
            options = a
          }
        } else {
          if (typeof a === 'function') {
            cb = a
          }
          options = {}
        }
        parser = new exports.Parser(options)
        return parser.parseString(str, cb)
      }
      exports.parseStringPromise = function (str, a) {
        var options, parser
        if (typeof a === 'object') {
          options = a
        }
        parser = new exports.Parser(options)
        return parser.parseStringPromise(str)
      }
    }.call(exports))
  },
})

// node_modules/xml2js/lib/xml2js.js
var require_xml2js = __commonJS({
  'node_modules/xml2js/lib/xml2js.js'(exports) {
    init_define_process()
    ;(function () {
      'use strict'
      var builder,
        defaults,
        parser,
        processors,
        extend = function (child, parent) {
          for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key]
          }
          function ctor() {
            this.constructor = child
          }
          ctor.prototype = parent.prototype
          child.prototype = new ctor()
          child.__super__ = parent.prototype
          return child
        },
        hasProp = {}.hasOwnProperty
      defaults = require_defaults()
      builder = require_builder()
      parser = require_parser()
      processors = require_processors()
      exports.defaults = defaults.defaults
      exports.processors = processors
      exports.ValidationError = (function (superClass) {
        extend(ValidationError, superClass)
        function ValidationError(message) {
          this.message = message
        }
        return ValidationError
      })(Error)
      exports.Builder = builder.Builder
      exports.Parser = parser.Parser
      exports.parseString = parser.parseString
      exports.parseStringPromise = parser.parseStringPromise
    }.call(exports))
  },
})

// (disabled):fs
var require_fs = __commonJS({
  '(disabled):fs'() {
    init_define_process()
  },
})

// node_modules/http-response-object/lib/index.js
var require_lib2 = __commonJS({
  'node_modules/http-response-object/lib/index.js'(exports, module) {
    'use strict'
    init_define_process()
    var Response = (function () {
      function Response2(statusCode, headers, body, url) {
        if (typeof statusCode !== 'number') {
          throw new TypeError('statusCode must be a number but was ' + typeof statusCode)
        }
        if (headers === null) {
          throw new TypeError('headers cannot be null')
        }
        if (typeof headers !== 'object') {
          throw new TypeError('headers must be an object but was ' + typeof headers)
        }
        this.statusCode = statusCode
        var headersToLowerCase = {}
        for (var key in headers) {
          headersToLowerCase[key.toLowerCase()] = headers[key]
        }
        this.headers = headersToLowerCase
        this.body = body
        this.url = url
      }
      Response2.prototype.isError = function () {
        return this.statusCode === 0 || this.statusCode >= 400
      }
      Response2.prototype.getBody = function (encoding) {
        if (this.statusCode === 0) {
          var err = new Error(
            'This request to ' +
              this.url +
              ' resulted in a status code of 0. This usually indicates some kind of network error in a browser (e.g. CORS not being set up or the DNS failing to resolve):\n' +
              this.body.toString(),
          )
          err.statusCode = this.statusCode
          err.headers = this.headers
          err.body = this.body
          err.url = this.url
          throw err
        }
        if (this.statusCode >= 300) {
          var err = new Error(
            'Server responded to ' + this.url + ' with status code ' + this.statusCode + ':\n' + this.body.toString(),
          )
          err.statusCode = this.statusCode
          err.headers = this.headers
          err.body = this.body
          err.url = this.url
          throw err
        }
        if (!encoding || typeof this.body === 'string') {
          return this.body
        }
        return this.body.toString(encoding)
      }
      return Response2
    })()
    module.exports = Response
  },
})

// node_modules/asap/browser-raw.js
var require_browser_raw = __commonJS({
  'node_modules/asap/browser-raw.js'(exports, module) {
    'use strict'
    init_define_process()
    module.exports = rawAsap
    function rawAsap(task) {
      if (!queue.length) {
        requestFlush()
        flushing = true
      }
      queue[queue.length] = task
    }
    var queue = []
    var flushing = false
    var requestFlush
    var index = 0
    var capacity = 1024
    function flush() {
      while (index < queue.length) {
        var currentIndex = index
        index = index + 1
        queue[currentIndex].call()
        if (index > capacity) {
          for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
            queue[scan] = queue[scan + index]
          }
          queue.length -= index
          index = 0
        }
      }
      queue.length = 0
      index = 0
      flushing = false
    }
    var scope = typeof globalThis !== 'undefined' ? globalThis : self
    var BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver
    if (typeof BrowserMutationObserver === 'function') {
      requestFlush = makeRequestCallFromMutationObserver(flush)
    } else {
      requestFlush = makeRequestCallFromTimer(flush)
    }
    rawAsap.requestFlush = requestFlush
    function makeRequestCallFromMutationObserver(callback) {
      var toggle = 1
      var observer = new BrowserMutationObserver(callback)
      var node = document.createTextNode('')
      observer.observe(node, { characterData: true })
      return function requestCall() {
        toggle = -toggle
        node.data = toggle
      }
    }
    function makeRequestCallFromTimer(callback) {
      return function requestCall() {
        var timeoutHandle = setTimeout(handleTimer, 0)
        var intervalHandle = setInterval(handleTimer, 50)
        function handleTimer() {
          clearTimeout(timeoutHandle)
          clearInterval(intervalHandle)
          callback()
        }
      }
    }
    rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer
  },
})

// node_modules/promise/lib/core.js
var require_core = __commonJS({
  'node_modules/promise/lib/core.js'(exports, module) {
    'use strict'
    init_define_process()
    var asap = require_browser_raw()
    function noop() {}
    var LAST_ERROR = null
    var IS_ERROR = {}
    function getThen(obj) {
      try {
        return obj.then
      } catch (ex) {
        LAST_ERROR = ex
        return IS_ERROR
      }
    }
    function tryCallOne(fn, a) {
      try {
        return fn(a)
      } catch (ex) {
        LAST_ERROR = ex
        return IS_ERROR
      }
    }
    function tryCallTwo(fn, a, b) {
      try {
        fn(a, b)
      } catch (ex) {
        LAST_ERROR = ex
        return IS_ERROR
      }
    }
    module.exports = Promise2
    function Promise2(fn) {
      if (typeof this !== 'object') {
        throw new TypeError('Promises must be constructed via new')
      }
      if (typeof fn !== 'function') {
        throw new TypeError("Promise constructor's argument is not a function")
      }
      this._U = 0
      this._V = 0
      this._W = null
      this._X = null
      if (fn === noop) return
      doResolve(fn, this)
    }
    Promise2._Y = null
    Promise2._Z = null
    Promise2._0 = noop
    Promise2.prototype.then = function (onFulfilled, onRejected) {
      if (this.constructor !== Promise2) {
        return safeThen(this, onFulfilled, onRejected)
      }
      var res = new Promise2(noop)
      handle(this, new Handler(onFulfilled, onRejected, res))
      return res
    }
    function safeThen(self2, onFulfilled, onRejected) {
      return new self2.constructor(function (resolve2, reject2) {
        var res = new Promise2(noop)
        res.then(resolve2, reject2)
        handle(self2, new Handler(onFulfilled, onRejected, res))
      })
    }
    function handle(self2, deferred) {
      while (self2._V === 3) {
        self2 = self2._W
      }
      if (Promise2._Y) {
        Promise2._Y(self2)
      }
      if (self2._V === 0) {
        if (self2._U === 0) {
          self2._U = 1
          self2._X = deferred
          return
        }
        if (self2._U === 1) {
          self2._U = 2
          self2._X = [self2._X, deferred]
          return
        }
        self2._X.push(deferred)
        return
      }
      handleResolved(self2, deferred)
    }
    function handleResolved(self2, deferred) {
      asap(function () {
        var cb = self2._V === 1 ? deferred.onFulfilled : deferred.onRejected
        if (cb === null) {
          if (self2._V === 1) {
            resolve(deferred.promise, self2._W)
          } else {
            reject(deferred.promise, self2._W)
          }
          return
        }
        var ret = tryCallOne(cb, self2._W)
        if (ret === IS_ERROR) {
          reject(deferred.promise, LAST_ERROR)
        } else {
          resolve(deferred.promise, ret)
        }
      })
    }
    function resolve(self2, newValue) {
      if (newValue === self2) {
        return reject(self2, new TypeError('A promise cannot be resolved with itself.'))
      }
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = getThen(newValue)
        if (then === IS_ERROR) {
          return reject(self2, LAST_ERROR)
        }
        if (then === self2.then && newValue instanceof Promise2) {
          self2._V = 3
          self2._W = newValue
          finale(self2)
          return
        } else if (typeof then === 'function') {
          doResolve(then.bind(newValue), self2)
          return
        }
      }
      self2._V = 1
      self2._W = newValue
      finale(self2)
    }
    function reject(self2, newValue) {
      self2._V = 2
      self2._W = newValue
      if (Promise2._Z) {
        Promise2._Z(self2, newValue)
      }
      finale(self2)
    }
    function finale(self2) {
      if (self2._U === 1) {
        handle(self2, self2._X)
        self2._X = null
      }
      if (self2._U === 2) {
        for (var i = 0; i < self2._X.length; i++) {
          handle(self2, self2._X[i])
        }
        self2._X = null
      }
    }
    function Handler(onFulfilled, onRejected, promise) {
      this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
      this.onRejected = typeof onRejected === 'function' ? onRejected : null
      this.promise = promise
    }
    function doResolve(fn, promise) {
      var done = false
      var res = tryCallTwo(
        fn,
        function (value) {
          if (done) return
          done = true
          resolve(promise, value)
        },
        function (reason) {
          if (done) return
          done = true
          reject(promise, reason)
        },
      )
      if (!done && res === IS_ERROR) {
        done = true
        reject(promise, LAST_ERROR)
      }
    }
  },
})

// node_modules/promise/lib/done.js
var require_done = __commonJS({
  'node_modules/promise/lib/done.js'(exports, module) {
    'use strict'
    init_define_process()
    var Promise2 = require_core()
    module.exports = Promise2
    Promise2.prototype.done = function (onFulfilled, onRejected) {
      var self2 = arguments.length ? this.then.apply(this, arguments) : this
      self2.then(null, function (err) {
        setTimeout(function () {
          throw err
        }, 0)
      })
    }
  },
})

// node_modules/promise/lib/finally.js
var require_finally = __commonJS({
  'node_modules/promise/lib/finally.js'(exports, module) {
    'use strict'
    init_define_process()
    var Promise2 = require_core()
    module.exports = Promise2
    Promise2.prototype.finally = function (f) {
      return this.then(
        function (value) {
          return Promise2.resolve(f()).then(function () {
            return value
          })
        },
        function (err) {
          return Promise2.resolve(f()).then(function () {
            throw err
          })
        },
      )
    }
  },
})

// node_modules/promise/lib/es6-extensions.js
var require_es6_extensions = __commonJS({
  'node_modules/promise/lib/es6-extensions.js'(exports, module) {
    'use strict'
    init_define_process()
    var Promise2 = require_core()
    module.exports = Promise2
    var TRUE = valuePromise(true)
    var FALSE = valuePromise(false)
    var NULL = valuePromise(null)
    var UNDEFINED = valuePromise(void 0)
    var ZERO = valuePromise(0)
    var EMPTYSTRING = valuePromise('')
    function valuePromise(value) {
      var p = new Promise2(Promise2._0)
      p._V = 1
      p._W = value
      return p
    }
    Promise2.resolve = function (value) {
      if (value instanceof Promise2) return value
      if (value === null) return NULL
      if (value === void 0) return UNDEFINED
      if (value === true) return TRUE
      if (value === false) return FALSE
      if (value === 0) return ZERO
      if (value === '') return EMPTYSTRING
      if (typeof value === 'object' || typeof value === 'function') {
        try {
          var then = value.then
          if (typeof then === 'function') {
            return new Promise2(then.bind(value))
          }
        } catch (ex) {
          return new Promise2(function (resolve, reject) {
            reject(ex)
          })
        }
      }
      return valuePromise(value)
    }
    var iterableToArray = function (iterable) {
      if (typeof Array.from === 'function') {
        iterableToArray = Array.from
        return Array.from(iterable)
      }
      iterableToArray = function (x) {
        return Array.prototype.slice.call(x)
      }
      return Array.prototype.slice.call(iterable)
    }
    Promise2.all = function (arr) {
      var args = iterableToArray(arr)
      return new Promise2(function (resolve, reject) {
        if (args.length === 0) return resolve([])
        var remaining = args.length
        function res(i2, val) {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            if (val instanceof Promise2 && val.then === Promise2.prototype.then) {
              while (val._V === 3) {
                val = val._W
              }
              if (val._V === 1) return res(i2, val._W)
              if (val._V === 2) reject(val._W)
              val.then(function (val2) {
                res(i2, val2)
              }, reject)
              return
            } else {
              var then = val.then
              if (typeof then === 'function') {
                var p = new Promise2(then.bind(val))
                p.then(function (val2) {
                  res(i2, val2)
                }, reject)
                return
              }
            }
          }
          args[i2] = val
          if (--remaining === 0) {
            resolve(args)
          }
        }
        for (var i = 0; i < args.length; i++) {
          res(i, args[i])
        }
      })
    }
    Promise2.reject = function (value) {
      return new Promise2(function (resolve, reject) {
        reject(value)
      })
    }
    Promise2.race = function (values) {
      return new Promise2(function (resolve, reject) {
        iterableToArray(values).forEach(function (value) {
          Promise2.resolve(value).then(resolve, reject)
        })
      })
    }
    Promise2.prototype['catch'] = function (onRejected) {
      return this.then(null, onRejected)
    }
  },
})

// node_modules/asap/browser-asap.js
var require_browser_asap = __commonJS({
  'node_modules/asap/browser-asap.js'(exports, module) {
    'use strict'
    init_define_process()
    var rawAsap = require_browser_raw()
    var freeTasks = []
    var pendingErrors = []
    var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError)
    function throwFirstError() {
      if (pendingErrors.length) {
        throw pendingErrors.shift()
      }
    }
    module.exports = asap
    function asap(task) {
      var rawTask
      if (freeTasks.length) {
        rawTask = freeTasks.pop()
      } else {
        rawTask = new RawTask()
      }
      rawTask.task = task
      rawAsap(rawTask)
    }
    function RawTask() {
      this.task = null
    }
    RawTask.prototype.call = function () {
      try {
        this.task.call()
      } catch (error) {
        if (asap.onerror) {
          asap.onerror(error)
        } else {
          pendingErrors.push(error)
          requestErrorThrow()
        }
      } finally {
        this.task = null
        freeTasks[freeTasks.length] = this
      }
    }
  },
})

// node_modules/promise/lib/node-extensions.js
var require_node_extensions = __commonJS({
  'node_modules/promise/lib/node-extensions.js'(exports, module) {
    'use strict'
    init_define_process()
    var Promise2 = require_core()
    var asap = require_browser_asap()
    module.exports = Promise2
    Promise2.denodeify = function (fn, argumentCount) {
      if (typeof argumentCount === 'number' && argumentCount !== Infinity) {
        return denodeifyWithCount(fn, argumentCount)
      } else {
        return denodeifyWithoutCount(fn)
      }
    }
    var callbackFn = 'function (err, res) {if (err) { rj(err); } else { rs(res); }}'
    function denodeifyWithCount(fn, argumentCount) {
      var args = []
      for (var i = 0; i < argumentCount; i++) {
        args.push('a' + i)
      }
      var body = [
        'return function (' + args.join(',') + ') {',
        'var self = this;',
        'return new Promise(function (rs, rj) {',
        'var res = fn.call(',
        ['self'].concat(args).concat([callbackFn]).join(','),
        ');',
        'if (res &&',
        '(typeof res === "object" || typeof res === "function") &&',
        'typeof res.then === "function"',
        ') {rs(res);}',
        '});',
        '};',
      ].join('')
      return Function(['Promise', 'fn'], body)(Promise2, fn)
    }
    function denodeifyWithoutCount(fn) {
      var fnLength = Math.max(fn.length - 1, 3)
      var args = []
      for (var i = 0; i < fnLength; i++) {
        args.push('a' + i)
      }
      var body = [
        'return function (' + args.join(',') + ') {',
        'var self = this;',
        'var args;',
        'var argLength = arguments.length;',
        'if (arguments.length > ' + fnLength + ') {',
        'args = new Array(arguments.length + 1);',
        'for (var i = 0; i < arguments.length; i++) {',
        'args[i] = arguments[i];',
        '}',
        '}',
        'return new Promise(function (rs, rj) {',
        'var cb = ' + callbackFn + ';',
        'var res;',
        'switch (argLength) {',
        args
          .concat(['extra'])
          .map(function (_, index) {
            return (
              'case ' +
              index +
              ':res = fn.call(' +
              ['self'].concat(args.slice(0, index)).concat('cb').join(',') +
              ');break;'
            )
          })
          .join(''),
        'default:',
        'args[argLength] = cb;',
        'res = fn.apply(self, args);',
        '}',
        'if (res &&',
        '(typeof res === "object" || typeof res === "function") &&',
        'typeof res.then === "function"',
        ') {rs(res);}',
        '});',
        '};',
      ].join('')
      return Function(['Promise', 'fn'], body)(Promise2, fn)
    }
    Promise2.nodeify = function (fn) {
      return function () {
        var args = Array.prototype.slice.call(arguments)
        var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
        var ctx = this
        try {
          return fn.apply(this, arguments).nodeify(callback, ctx)
        } catch (ex) {
          if (callback === null || typeof callback == 'undefined') {
            return new Promise2(function (resolve, reject) {
              reject(ex)
            })
          } else {
            asap(function () {
              callback.call(ctx, ex)
            })
          }
        }
      }
    }
    Promise2.prototype.nodeify = function (callback, ctx) {
      if (typeof callback != 'function') return this
      this.then(
        function (value) {
          asap(function () {
            callback.call(ctx, null, value)
          })
        },
        function (err) {
          asap(function () {
            callback.call(ctx, err)
          })
        },
      )
    }
  },
})

// node_modules/promise/lib/synchronous.js
var require_synchronous = __commonJS({
  'node_modules/promise/lib/synchronous.js'(exports, module) {
    'use strict'
    init_define_process()
    var Promise2 = require_core()
    module.exports = Promise2
    Promise2.enableSynchronous = function () {
      Promise2.prototype.isPending = function () {
        return this.getState() == 0
      }
      Promise2.prototype.isFulfilled = function () {
        return this.getState() == 1
      }
      Promise2.prototype.isRejected = function () {
        return this.getState() == 2
      }
      Promise2.prototype.getValue = function () {
        if (this._V === 3) {
          return this._W.getValue()
        }
        if (!this.isFulfilled()) {
          throw new Error('Cannot get a value of an unfulfilled promise.')
        }
        return this._W
      }
      Promise2.prototype.getReason = function () {
        if (this._V === 3) {
          return this._W.getReason()
        }
        if (!this.isRejected()) {
          throw new Error('Cannot get a rejection reason of a non-rejected promise.')
        }
        return this._W
      }
      Promise2.prototype.getState = function () {
        if (this._V === 3) {
          return this._W.getState()
        }
        if (this._V === -1 || this._V === -2) {
          return 0
        }
        return this._V
      }
    }
    Promise2.disableSynchronous = function () {
      Promise2.prototype.isPending = void 0
      Promise2.prototype.isFulfilled = void 0
      Promise2.prototype.isRejected = void 0
      Promise2.prototype.getValue = void 0
      Promise2.prototype.getReason = void 0
      Promise2.prototype.getState = void 0
    }
  },
})

// node_modules/promise/lib/index.js
var require_lib3 = __commonJS({
  'node_modules/promise/lib/index.js'(exports, module) {
    'use strict'
    init_define_process()
    module.exports = require_core()
    require_done()
    require_finally()
    require_es6_extensions()
    require_node_extensions()
    require_synchronous()
  },
})

// node_modules/promise/index.js
var require_promise = __commonJS({
  'node_modules/promise/index.js'(exports, module) {
    'use strict'
    init_define_process()
    module.exports = require_lib3()
  },
})

// node_modules/then-request/lib/ResponsePromise.js
var require_ResponsePromise = __commonJS({
  'node_modules/then-request/lib/ResponsePromise.js'(exports) {
    'use strict'
    init_define_process()
    exports.__esModule = true
    var Promise2 = require_promise()
    function getBody(encoding) {
      if (!encoding) {
        return this.then(getBodyBinary)
      }
      if (encoding === 'utf8') {
        return this.then(getBodyUTF8)
      }
      return this.then(getBodyWithEncoding(encoding))
    }
    function getBodyWithEncoding(encoding) {
      return function (res) {
        return res.getBody(encoding)
      }
    }
    function getBodyBinary(res) {
      return res.getBody()
    }
    function getBodyUTF8(res) {
      return res.getBody('utf8')
    }
    function toResponsePromise(result) {
      result.getBody = getBody
      return result
    }
    exports['default'] = toResponsePromise
    exports.ResponsePromise = void 0
  },
})

// node_modules/has-symbols/shams.js
var require_shams = __commonJS({
  'node_modules/has-symbols/shams.js'(exports, module) {
    'use strict'
    init_define_process()
    module.exports = function hasSymbols() {
      if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') {
        return false
      }
      if (typeof Symbol.iterator === 'symbol') {
        return true
      }
      var obj = {}
      var sym = Symbol('test')
      var symObj = Object(sym)
      if (typeof sym === 'string') {
        return false
      }
      if (Object.prototype.toString.call(sym) !== '[object Symbol]') {
        return false
      }
      if (Object.prototype.toString.call(symObj) !== '[object Symbol]') {
        return false
      }
      var symVal = 42
      obj[sym] = symVal
      for (sym in obj) {
        return false
      }
      if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) {
        return false
      }
      if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) {
        return false
      }
      var syms = Object.getOwnPropertySymbols(obj)
      if (syms.length !== 1 || syms[0] !== sym) {
        return false
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false
      }
      if (typeof Object.getOwnPropertyDescriptor === 'function') {
        var descriptor = Object.getOwnPropertyDescriptor(obj, sym)
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false
        }
      }
      return true
    }
  },
})

// node_modules/has-symbols/index.js
var require_has_symbols = __commonJS({
  'node_modules/has-symbols/index.js'(exports, module) {
    'use strict'
    init_define_process()
    var origSymbol = typeof Symbol !== 'undefined' && Symbol
    var hasSymbolSham = require_shams()
    module.exports = function hasNativeSymbols() {
      if (typeof origSymbol !== 'function') {
        return false
      }
      if (typeof Symbol !== 'function') {
        return false
      }
      if (typeof origSymbol('foo') !== 'symbol') {
        return false
      }
      if (typeof Symbol('bar') !== 'symbol') {
        return false
      }
      return hasSymbolSham()
    }
  },
})

// node_modules/function-bind/implementation.js
var require_implementation = __commonJS({
  'node_modules/function-bind/implementation.js'(exports, module) {
    'use strict'
    init_define_process()
    var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible '
    var slice = Array.prototype.slice
    var toStr = Object.prototype.toString
    var funcType = '[object Function]'
    module.exports = function bind(that) {
      var target = this
      if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target)
      }
      var args = slice.call(arguments, 1)
      var bound
      var binder = function () {
        if (this instanceof bound) {
          var result = target.apply(this, args.concat(slice.call(arguments)))
          if (Object(result) === result) {
            return result
          }
          return this
        } else {
          return target.apply(that, args.concat(slice.call(arguments)))
        }
      }
      var boundLength = Math.max(0, target.length - args.length)
      var boundArgs = []
      for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i)
      }
      bound = Function(
        'binder',
        'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }',
      )(binder)
      if (target.prototype) {
        var Empty = function Empty2() {}
        Empty.prototype = target.prototype
        bound.prototype = new Empty()
        Empty.prototype = null
      }
      return bound
    }
  },
})

// node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  'node_modules/function-bind/index.js'(exports, module) {
    'use strict'
    init_define_process()
    var implementation = require_implementation()
    module.exports = Function.prototype.bind || implementation
  },
})

// node_modules/has/src/index.js
var require_src = __commonJS({
  'node_modules/has/src/index.js'(exports, module) {
    'use strict'
    init_define_process()
    var bind = require_function_bind()
    module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty)
  },
})

// node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS({
  'node_modules/get-intrinsic/index.js'(exports, module) {
    'use strict'
    init_define_process()
    var undefined2
    var $SyntaxError = SyntaxError
    var $Function = Function
    var $TypeError = TypeError
    var getEvalledConstructor = function (expressionSyntax) {
      try {
        return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')()
      } catch (e) {}
    }
    var $gOPD = Object.getOwnPropertyDescriptor
    if ($gOPD) {
      try {
        $gOPD({}, '')
      } catch (e) {
        $gOPD = null
      }
    }
    var throwTypeError = function () {
      throw new $TypeError()
    }
    var ThrowTypeError = $gOPD
      ? (function () {
          try {
            arguments.callee
            return throwTypeError
          } catch (calleeThrows) {
            try {
              return $gOPD(arguments, 'callee').get
            } catch (gOPDthrows) {
              return throwTypeError
            }
          }
        })()
      : throwTypeError
    var hasSymbols = require_has_symbols()()
    var getProto =
      Object.getPrototypeOf ||
      function (x) {
        return x.__proto__
      }
    var needsEval = {}
    var TypedArray = typeof Uint8Array === 'undefined' ? undefined2 : getProto(Uint8Array)
    var INTRINSICS = {
      '%AggregateError%': typeof AggregateError === 'undefined' ? undefined2 : AggregateError,
      '%Array%': Array,
      '%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined2 : ArrayBuffer,
      '%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined2,
      '%AsyncFromSyncIteratorPrototype%': undefined2,
      '%AsyncFunction%': needsEval,
      '%AsyncGenerator%': needsEval,
      '%AsyncGeneratorFunction%': needsEval,
      '%AsyncIteratorPrototype%': needsEval,
      '%Atomics%': typeof Atomics === 'undefined' ? undefined2 : Atomics,
      '%BigInt%': typeof BigInt === 'undefined' ? undefined2 : BigInt,
      '%Boolean%': Boolean,
      '%DataView%': typeof DataView === 'undefined' ? undefined2 : DataView,
      '%Date%': Date,
      '%decodeURI%': decodeURI,
      '%decodeURIComponent%': decodeURIComponent,
      '%encodeURI%': encodeURI,
      '%encodeURIComponent%': encodeURIComponent,
      '%Error%': Error,
      '%eval%': eval,
      '%EvalError%': EvalError,
      '%Float32Array%': typeof Float32Array === 'undefined' ? undefined2 : Float32Array,
      '%Float64Array%': typeof Float64Array === 'undefined' ? undefined2 : Float64Array,
      '%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined2 : FinalizationRegistry,
      '%Function%': $Function,
      '%GeneratorFunction%': needsEval,
      '%Int8Array%': typeof Int8Array === 'undefined' ? undefined2 : Int8Array,
      '%Int16Array%': typeof Int16Array === 'undefined' ? undefined2 : Int16Array,
      '%Int32Array%': typeof Int32Array === 'undefined' ? undefined2 : Int32Array,
      '%isFinite%': isFinite,
      '%isNaN%': isNaN,
      '%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined2,
      '%JSON%': typeof JSON === 'object' ? JSON : undefined2,
      '%Map%': typeof Map === 'undefined' ? undefined2 : Map,
      '%MapIteratorPrototype%':
        typeof Map === 'undefined' || !hasSymbols ? undefined2 : getProto(/* @__PURE__ */ new Map()[Symbol.iterator]()),
      '%Math%': Math,
      '%Number%': Number,
      '%Object%': Object,
      '%parseFloat%': parseFloat,
      '%parseInt%': parseInt,
      '%Promise%': typeof Promise === 'undefined' ? undefined2 : Promise,
      '%Proxy%': typeof Proxy === 'undefined' ? undefined2 : Proxy,
      '%RangeError%': RangeError,
      '%ReferenceError%': ReferenceError,
      '%Reflect%': typeof Reflect === 'undefined' ? undefined2 : Reflect,
      '%RegExp%': RegExp,
      '%Set%': typeof Set === 'undefined' ? undefined2 : Set,
      '%SetIteratorPrototype%':
        typeof Set === 'undefined' || !hasSymbols ? undefined2 : getProto(/* @__PURE__ */ new Set()[Symbol.iterator]()),
      '%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined2 : SharedArrayBuffer,
      '%String%': String,
      '%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined2,
      '%Symbol%': hasSymbols ? Symbol : undefined2,
      '%SyntaxError%': $SyntaxError,
      '%ThrowTypeError%': ThrowTypeError,
      '%TypedArray%': TypedArray,
      '%TypeError%': $TypeError,
      '%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined2 : Uint8Array,
      '%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined2 : Uint8ClampedArray,
      '%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined2 : Uint16Array,
      '%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined2 : Uint32Array,
      '%URIError%': URIError,
      '%WeakMap%': typeof WeakMap === 'undefined' ? undefined2 : WeakMap,
      '%WeakRef%': typeof WeakRef === 'undefined' ? undefined2 : WeakRef,
      '%WeakSet%': typeof WeakSet === 'undefined' ? undefined2 : WeakSet,
    }
    var doEval = function doEval2(name) {
      var value
      if (name === '%AsyncFunction%') {
        value = getEvalledConstructor('async function () {}')
      } else if (name === '%GeneratorFunction%') {
        value = getEvalledConstructor('function* () {}')
      } else if (name === '%AsyncGeneratorFunction%') {
        value = getEvalledConstructor('async function* () {}')
      } else if (name === '%AsyncGenerator%') {
        var fn = doEval2('%AsyncGeneratorFunction%')
        if (fn) {
          value = fn.prototype
        }
      } else if (name === '%AsyncIteratorPrototype%') {
        var gen = doEval2('%AsyncGenerator%')
        if (gen) {
          value = getProto(gen.prototype)
        }
      }
      INTRINSICS[name] = value
      return value
    }
    var LEGACY_ALIASES = {
      '%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
      '%ArrayPrototype%': ['Array', 'prototype'],
      '%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
      '%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
      '%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
      '%ArrayProto_values%': ['Array', 'prototype', 'values'],
      '%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
      '%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
      '%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
      '%BooleanPrototype%': ['Boolean', 'prototype'],
      '%DataViewPrototype%': ['DataView', 'prototype'],
      '%DatePrototype%': ['Date', 'prototype'],
      '%ErrorPrototype%': ['Error', 'prototype'],
      '%EvalErrorPrototype%': ['EvalError', 'prototype'],
      '%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
      '%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
      '%FunctionPrototype%': ['Function', 'prototype'],
      '%Generator%': ['GeneratorFunction', 'prototype'],
      '%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
      '%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
      '%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
      '%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
      '%JSONParse%': ['JSON', 'parse'],
      '%JSONStringify%': ['JSON', 'stringify'],
      '%MapPrototype%': ['Map', 'prototype'],
      '%NumberPrototype%': ['Number', 'prototype'],
      '%ObjectPrototype%': ['Object', 'prototype'],
      '%ObjProto_toString%': ['Object', 'prototype', 'toString'],
      '%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
      '%PromisePrototype%': ['Promise', 'prototype'],
      '%PromiseProto_then%': ['Promise', 'prototype', 'then'],
      '%Promise_all%': ['Promise', 'all'],
      '%Promise_reject%': ['Promise', 'reject'],
      '%Promise_resolve%': ['Promise', 'resolve'],
      '%RangeErrorPrototype%': ['RangeError', 'prototype'],
      '%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
      '%RegExpPrototype%': ['RegExp', 'prototype'],
      '%SetPrototype%': ['Set', 'prototype'],
      '%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
      '%StringPrototype%': ['String', 'prototype'],
      '%SymbolPrototype%': ['Symbol', 'prototype'],
      '%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
      '%TypedArrayPrototype%': ['TypedArray', 'prototype'],
      '%TypeErrorPrototype%': ['TypeError', 'prototype'],
      '%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
      '%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
      '%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
      '%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
      '%URIErrorPrototype%': ['URIError', 'prototype'],
      '%WeakMapPrototype%': ['WeakMap', 'prototype'],
      '%WeakSetPrototype%': ['WeakSet', 'prototype'],
    }
    var bind = require_function_bind()
    var hasOwn = require_src()
    var $concat = bind.call(Function.call, Array.prototype.concat)
    var $spliceApply = bind.call(Function.apply, Array.prototype.splice)
    var $replace = bind.call(Function.call, String.prototype.replace)
    var $strSlice = bind.call(Function.call, String.prototype.slice)
    var rePropName =
      /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g
    var reEscapeChar = /\\(\\)?/g
    var stringToPath = function stringToPath2(string) {
      var first = $strSlice(string, 0, 1)
      var last = $strSlice(string, -1)
      if (first === '%' && last !== '%') {
        throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`')
      } else if (last === '%' && first !== '%') {
        throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`')
      }
      var result = []
      $replace(string, rePropName, function (match, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match
      })
      return result
    }
    var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
      var intrinsicName = name
      var alias
      if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName]
        intrinsicName = '%' + alias[0] + '%'
      }
      if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName]
        if (value === needsEval) {
          value = doEval(intrinsicName)
        }
        if (typeof value === 'undefined' && !allowMissing) {
          throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!')
        }
        return {
          alias,
          name: intrinsicName,
          value,
        }
      }
      throw new $SyntaxError('intrinsic ' + name + ' does not exist!')
    }
    module.exports = function GetIntrinsic(name, allowMissing) {
      if (typeof name !== 'string' || name.length === 0) {
        throw new $TypeError('intrinsic name must be a non-empty string')
      }
      if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
        throw new $TypeError('"allowMissing" argument must be a boolean')
      }
      var parts = stringToPath(name)
      var intrinsicBaseName = parts.length > 0 ? parts[0] : ''
      var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing)
      var intrinsicRealName = intrinsic.name
      var value = intrinsic.value
      var skipFurtherCaching = false
      var alias = intrinsic.alias
      if (alias) {
        intrinsicBaseName = alias[0]
        $spliceApply(parts, $concat([0, 1], alias))
      }
      for (var i = 1, isOwn = true; i < parts.length; i += 1) {
        var part = parts[i]
        var first = $strSlice(part, 0, 1)
        var last = $strSlice(part, -1)
        if (
          (first === '"' || first === "'" || first === '`' || last === '"' || last === "'" || last === '`') &&
          first !== last
        ) {
          throw new $SyntaxError('property names with quotes must have matching quotes')
        }
        if (part === 'constructor' || !isOwn) {
          skipFurtherCaching = true
        }
        intrinsicBaseName += '.' + part
        intrinsicRealName = '%' + intrinsicBaseName + '%'
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
          value = INTRINSICS[intrinsicRealName]
        } else if (value != null) {
          if (!(part in value)) {
            if (!allowMissing) {
              throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.')
            }
            return void 0
          }
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, part)
            isOwn = !!desc
            if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
              value = desc.get
            } else {
              value = value[part]
            }
          } else {
            isOwn = hasOwn(value, part)
            value = value[part]
          }
          if (isOwn && !skipFurtherCaching) {
            INTRINSICS[intrinsicRealName] = value
          }
        }
      }
      return value
    }
  },
})

// node_modules/call-bind/index.js
var require_call_bind = __commonJS({
  'node_modules/call-bind/index.js'(exports, module) {
    'use strict'
    init_define_process()
    var bind = require_function_bind()
    var GetIntrinsic = require_get_intrinsic()
    var $apply = GetIntrinsic('%Function.prototype.apply%')
    var $call = GetIntrinsic('%Function.prototype.call%')
    var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply)
    var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true)
    var $defineProperty = GetIntrinsic('%Object.defineProperty%', true)
    var $max = GetIntrinsic('%Math.max%')
    if ($defineProperty) {
      try {
        $defineProperty({}, 'a', { value: 1 })
      } catch (e) {
        $defineProperty = null
      }
    }
    module.exports = function callBind(originalFunction) {
      var func = $reflectApply(bind, $call, arguments)
      if ($gOPD && $defineProperty) {
        var desc = $gOPD(func, 'length')
        if (desc.configurable) {
          $defineProperty(func, 'length', { value: 1 + $max(0, originalFunction.length - (arguments.length - 1)) })
        }
      }
      return func
    }
    var applyBind = function applyBind2() {
      return $reflectApply(bind, $apply, arguments)
    }
    if ($defineProperty) {
      $defineProperty(module.exports, 'apply', { value: applyBind })
    } else {
      module.exports.apply = applyBind
    }
  },
})

// node_modules/call-bind/callBound.js
var require_callBound = __commonJS({
  'node_modules/call-bind/callBound.js'(exports, module) {
    'use strict'
    init_define_process()
    var GetIntrinsic = require_get_intrinsic()
    var callBind = require_call_bind()
    var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'))
    module.exports = function callBoundIntrinsic(name, allowMissing) {
      var intrinsic = GetIntrinsic(name, !!allowMissing)
      if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
        return callBind(intrinsic)
      }
      return intrinsic
    }
  },
})

// (disabled):node_modules/object-inspect/util.inspect
var require_util = __commonJS({
  '(disabled):node_modules/object-inspect/util.inspect'() {
    init_define_process()
  },
})

// node_modules/object-inspect/index.js
var require_object_inspect = __commonJS({
  'node_modules/object-inspect/index.js'(exports, module) {
    init_define_process()
    var hasMap = typeof Map === 'function' && Map.prototype
    var mapSizeDescriptor =
      Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null
    var mapSize =
      hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null
    var mapForEach = hasMap && Map.prototype.forEach
    var hasSet = typeof Set === 'function' && Set.prototype
    var setSizeDescriptor =
      Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null
    var setSize =
      hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null
    var setForEach = hasSet && Set.prototype.forEach
    var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype
    var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null
    var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype
    var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null
    var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype
    var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null
    var booleanValueOf = Boolean.prototype.valueOf
    var objectToString = Object.prototype.toString
    var functionToString = Function.prototype.toString
    var match = String.prototype.match
    var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null
    var gOPS = Object.getOwnPropertySymbols
    var symToString =
      typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? Symbol.prototype.toString : null
    var hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object'
    var isEnumerable = Object.prototype.propertyIsEnumerable
    var gPO =
      (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) ||
      ([].__proto__ === Array.prototype
        ? function (O) {
            return O.__proto__
          }
        : null)
    var inspectCustom = require_util().custom
    var inspectSymbol = inspectCustom && isSymbol(inspectCustom) ? inspectCustom : null
    var toStringTag =
      typeof Symbol === 'function' && typeof Symbol.toStringTag !== 'undefined' ? Symbol.toStringTag : null
    module.exports = function inspect_(obj, options, depth, seen) {
      var opts = options || {}
      if (has(opts, 'quoteStyle') && opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double') {
        throw new TypeError('option "quoteStyle" must be "single" or "double"')
      }
      if (
        has(opts, 'maxStringLength') &&
        (typeof opts.maxStringLength === 'number'
          ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity
          : opts.maxStringLength !== null)
      ) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`')
      }
      var customInspect = has(opts, 'customInspect') ? opts.customInspect : true
      if (typeof customInspect !== 'boolean') {
        throw new TypeError('option "customInspect", if provided, must be `true` or `false`')
      }
      if (
        has(opts, 'indent') &&
        opts.indent !== null &&
        opts.indent !== '	' &&
        !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)
      ) {
        throw new TypeError('options "indent" must be "\\t", an integer > 0, or `null`')
      }
      if (typeof obj === 'undefined') {
        return 'undefined'
      }
      if (obj === null) {
        return 'null'
      }
      if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false'
      }
      if (typeof obj === 'string') {
        return inspectString(obj, opts)
      }
      if (typeof obj === 'number') {
        if (obj === 0) {
          return Infinity / obj > 0 ? '0' : '-0'
        }
        return String(obj)
      }
      if (typeof obj === 'bigint') {
        return String(obj) + 'n'
      }
      var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth
      if (typeof depth === 'undefined') {
        depth = 0
      }
      if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
        return isArray(obj) ? '[Array]' : '[Object]'
      }
      var indent = getIndent(opts, depth)
      if (typeof seen === 'undefined') {
        seen = []
      } else if (indexOf(seen, obj) >= 0) {
        return '[Circular]'
      }
      function inspect(value, from, noIndent) {
        if (from) {
          seen = seen.slice()
          seen.push(from)
        }
        if (noIndent) {
          var newOpts = {
            depth: opts.depth,
          }
          if (has(opts, 'quoteStyle')) {
            newOpts.quoteStyle = opts.quoteStyle
          }
          return inspect_(value, newOpts, depth + 1, seen)
        }
        return inspect_(value, opts, depth + 1, seen)
      }
      if (typeof obj === 'function') {
        var name = nameOf(obj)
        var keys = arrObjKeys(obj, inspect)
        return (
          '[Function' +
          (name ? ': ' + name : ' (anonymous)') +
          ']' +
          (keys.length > 0 ? ' { ' + keys.join(', ') + ' }' : '')
        )
      }
      if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? String(obj).replace(/^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj)
        return typeof obj === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString
      }
      if (isElement(obj)) {
        var s = '<' + String(obj.nodeName).toLowerCase()
        var attrs = obj.attributes || []
        for (var i = 0; i < attrs.length; i++) {
          s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts)
        }
        s += '>'
        if (obj.childNodes && obj.childNodes.length) {
          s += '...'
        }
        s += '</' + String(obj.nodeName).toLowerCase() + '>'
        return s
      }
      if (isArray(obj)) {
        if (obj.length === 0) {
          return '[]'
        }
        var xs = arrObjKeys(obj, inspect)
        if (indent && !singleLineValues(xs)) {
          return '[' + indentedJoin(xs, indent) + ']'
        }
        return '[ ' + xs.join(', ') + ' ]'
      }
      if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect)
        if (parts.length === 0) {
          return '[' + String(obj) + ']'
        }
        return '{ [' + String(obj) + '] ' + parts.join(', ') + ' }'
      }
      if (typeof obj === 'object' && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === 'function') {
          return obj[inspectSymbol]()
        } else if (typeof obj.inspect === 'function') {
          return obj.inspect()
        }
      }
      if (isMap(obj)) {
        var mapParts = []
        mapForEach.call(obj, function (value, key) {
          mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj))
        })
        return collectionOf('Map', mapSize.call(obj), mapParts, indent)
      }
      if (isSet(obj)) {
        var setParts = []
        setForEach.call(obj, function (value) {
          setParts.push(inspect(value, obj))
        })
        return collectionOf('Set', setSize.call(obj), setParts, indent)
      }
      if (isWeakMap(obj)) {
        return weakCollectionOf('WeakMap')
      }
      if (isWeakSet(obj)) {
        return weakCollectionOf('WeakSet')
      }
      if (isWeakRef(obj)) {
        return weakCollectionOf('WeakRef')
      }
      if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)))
      }
      if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)))
      }
      if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj))
      }
      if (isString(obj)) {
        return markBoxed(inspect(String(obj)))
      }
      if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect)
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object
        var protoTag = obj instanceof Object ? '' : 'null prototype'
        var stringTag =
          !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj
            ? toStr(obj).slice(8, -1)
            : protoTag
            ? 'Object'
            : ''
        var constructorTag =
          isPlainObject || typeof obj.constructor !== 'function'
            ? ''
            : obj.constructor.name
            ? obj.constructor.name + ' '
            : ''
        var tag =
          constructorTag +
          (stringTag || protoTag ? '[' + [].concat(stringTag || [], protoTag || []).join(': ') + '] ' : '')
        if (ys.length === 0) {
          return tag + '{}'
        }
        if (indent) {
          return tag + '{' + indentedJoin(ys, indent) + '}'
        }
        return tag + '{ ' + ys.join(', ') + ' }'
      }
      return String(obj)
    }
    function wrapQuotes(s, defaultStyle, opts) {
      var quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'"
      return quoteChar + s + quoteChar
    }
    function quote(s) {
      return String(s).replace(/"/g, '&quot;')
    }
    function isArray(obj) {
      return toStr(obj) === '[object Array]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj))
    }
    function isDate(obj) {
      return toStr(obj) === '[object Date]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj))
    }
    function isRegExp(obj) {
      return toStr(obj) === '[object RegExp]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj))
    }
    function isError(obj) {
      return toStr(obj) === '[object Error]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj))
    }
    function isString(obj) {
      return toStr(obj) === '[object String]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj))
    }
    function isNumber(obj) {
      return toStr(obj) === '[object Number]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj))
    }
    function isBoolean(obj) {
      return toStr(obj) === '[object Boolean]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj))
    }
    function isSymbol(obj) {
      if (hasShammedSymbols) {
        return obj && typeof obj === 'object' && obj instanceof Symbol
      }
      if (typeof obj === 'symbol') {
        return true
      }
      if (!obj || typeof obj !== 'object' || !symToString) {
        return false
      }
      try {
        symToString.call(obj)
        return true
      } catch (e) {}
      return false
    }
    function isBigInt(obj) {
      if (!obj || typeof obj !== 'object' || !bigIntValueOf) {
        return false
      }
      try {
        bigIntValueOf.call(obj)
        return true
      } catch (e) {}
      return false
    }
    var hasOwn =
      Object.prototype.hasOwnProperty ||
      function (key) {
        return key in this
      }
    function has(obj, key) {
      return hasOwn.call(obj, key)
    }
    function toStr(obj) {
      return objectToString.call(obj)
    }
    function nameOf(f) {
      if (f.name) {
        return f.name
      }
      var m = match.call(functionToString.call(f), /^function\s*([\w$]+)/)
      if (m) {
        return m[1]
      }
      return null
    }
    function indexOf(xs, x) {
      if (xs.indexOf) {
        return xs.indexOf(x)
      }
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) {
          return i
        }
      }
      return -1
    }
    function isMap(x) {
      if (!mapSize || !x || typeof x !== 'object') {
        return false
      }
      try {
        mapSize.call(x)
        try {
          setSize.call(x)
        } catch (s) {
          return true
        }
        return x instanceof Map
      } catch (e) {}
      return false
    }
    function isWeakMap(x) {
      if (!weakMapHas || !x || typeof x !== 'object') {
        return false
      }
      try {
        weakMapHas.call(x, weakMapHas)
        try {
          weakSetHas.call(x, weakSetHas)
        } catch (s) {
          return true
        }
        return x instanceof WeakMap
      } catch (e) {}
      return false
    }
    function isWeakRef(x) {
      if (!weakRefDeref || !x || typeof x !== 'object') {
        return false
      }
      try {
        weakRefDeref.call(x)
        return true
      } catch (e) {}
      return false
    }
    function isSet(x) {
      if (!setSize || !x || typeof x !== 'object') {
        return false
      }
      try {
        setSize.call(x)
        try {
          mapSize.call(x)
        } catch (m) {
          return true
        }
        return x instanceof Set
      } catch (e) {}
      return false
    }
    function isWeakSet(x) {
      if (!weakSetHas || !x || typeof x !== 'object') {
        return false
      }
      try {
        weakSetHas.call(x, weakSetHas)
        try {
          weakMapHas.call(x, weakMapHas)
        } catch (s) {
          return true
        }
        return x instanceof WeakSet
      } catch (e) {}
      return false
    }
    function isElement(x) {
      if (!x || typeof x !== 'object') {
        return false
      }
      if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
        return true
      }
      return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function'
    }
    function inspectString(str, opts) {
      if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength
        var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '')
        return inspectString(str.slice(0, opts.maxStringLength), opts) + trailer
      }
      var s = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, lowbyte)
      return wrapQuotes(s, 'single', opts)
    }
    function lowbyte(c) {
      var n = c.charCodeAt(0)
      var x = {
        8: 'b',
        9: 't',
        10: 'n',
        12: 'f',
        13: 'r',
      }[n]
      if (x) {
        return '\\' + x
      }
      return '\\x' + (n < 16 ? '0' : '') + n.toString(16).toUpperCase()
    }
    function markBoxed(str) {
      return 'Object(' + str + ')'
    }
    function weakCollectionOf(type) {
      return type + ' { ? }'
    }
    function collectionOf(type, size, entries, indent) {
      var joinedEntries = indent ? indentedJoin(entries, indent) : entries.join(', ')
      return type + ' (' + size + ') {' + joinedEntries + '}'
    }
    function singleLineValues(xs) {
      for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], '\n') >= 0) {
          return false
        }
      }
      return true
    }
    function getIndent(opts, depth) {
      var baseIndent
      if (opts.indent === '	') {
        baseIndent = '	'
      } else if (typeof opts.indent === 'number' && opts.indent > 0) {
        baseIndent = Array(opts.indent + 1).join(' ')
      } else {
        return null
      }
      return {
        base: baseIndent,
        prev: Array(depth + 1).join(baseIndent),
      }
    }
    function indentedJoin(xs, indent) {
      if (xs.length === 0) {
        return ''
      }
      var lineJoiner = '\n' + indent.prev + indent.base
      return lineJoiner + xs.join(',' + lineJoiner) + '\n' + indent.prev
    }
    function arrObjKeys(obj, inspect) {
      var isArr = isArray(obj)
      var xs = []
      if (isArr) {
        xs.length = obj.length
        for (var i = 0; i < obj.length; i++) {
          xs[i] = has(obj, i) ? inspect(obj[i], obj) : ''
        }
      }
      var syms = typeof gOPS === 'function' ? gOPS(obj) : []
      var symMap
      if (hasShammedSymbols) {
        symMap = {}
        for (var k = 0; k < syms.length; k++) {
          symMap['$' + syms[k]] = syms[k]
        }
      }
      for (var key in obj) {
        if (!has(obj, key)) {
          continue
        }
        if (isArr && String(Number(key)) === key && key < obj.length) {
          continue
        }
        if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
          continue
        } else if (/[^\w$]/.test(key)) {
          xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj))
        } else {
          xs.push(key + ': ' + inspect(obj[key], obj))
        }
      }
      if (typeof gOPS === 'function') {
        for (var j = 0; j < syms.length; j++) {
          if (isEnumerable.call(obj, syms[j])) {
            xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj))
          }
        }
      }
      return xs
    }
  },
})

// node_modules/side-channel/index.js
var require_side_channel = __commonJS({
  'node_modules/side-channel/index.js'(exports, module) {
    'use strict'
    init_define_process()
    var GetIntrinsic = require_get_intrinsic()
    var callBound = require_callBound()
    var inspect = require_object_inspect()
    var $TypeError = GetIntrinsic('%TypeError%')
    var $WeakMap = GetIntrinsic('%WeakMap%', true)
    var $Map = GetIntrinsic('%Map%', true)
    var $weakMapGet = callBound('WeakMap.prototype.get', true)
    var $weakMapSet = callBound('WeakMap.prototype.set', true)
    var $weakMapHas = callBound('WeakMap.prototype.has', true)
    var $mapGet = callBound('Map.prototype.get', true)
    var $mapSet = callBound('Map.prototype.set', true)
    var $mapHas = callBound('Map.prototype.has', true)
    var listGetNode = function (list, key) {
      for (var prev = list, curr; (curr = prev.next) !== null; prev = curr) {
        if (curr.key === key) {
          prev.next = curr.next
          curr.next = list.next
          list.next = curr
          return curr
        }
      }
    }
    var listGet = function (objects, key) {
      var node = listGetNode(objects, key)
      return node && node.value
    }
    var listSet = function (objects, key, value) {
      var node = listGetNode(objects, key)
      if (node) {
        node.value = value
      } else {
        objects.next = {
          key,
          next: objects.next,
          value,
        }
      }
    }
    var listHas = function (objects, key) {
      return !!listGetNode(objects, key)
    }
    module.exports = function getSideChannel() {
      var $wm
      var $m
      var $o
      var channel = {
        assert: function (key) {
          if (!channel.has(key)) {
            throw new $TypeError('Side channel does not contain ' + inspect(key))
          }
        },
        get: function (key) {
          if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
            if ($wm) {
              return $weakMapGet($wm, key)
            }
          } else if ($Map) {
            if ($m) {
              return $mapGet($m, key)
            }
          } else {
            if ($o) {
              return listGet($o, key)
            }
          }
        },
        has: function (key) {
          if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
            if ($wm) {
              return $weakMapHas($wm, key)
            }
          } else if ($Map) {
            if ($m) {
              return $mapHas($m, key)
            }
          } else {
            if ($o) {
              return listHas($o, key)
            }
          }
          return false
        },
        set: function (key, value) {
          if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
            if (!$wm) {
              $wm = new $WeakMap()
            }
            $weakMapSet($wm, key, value)
          } else if ($Map) {
            if (!$m) {
              $m = new $Map()
            }
            $mapSet($m, key, value)
          } else {
            if (!$o) {
              $o = { key: {}, next: null }
            }
            listSet($o, key, value)
          }
        },
      }
      return channel
    }
  },
})

// node_modules/qs/lib/formats.js
var require_formats = __commonJS({
  'node_modules/qs/lib/formats.js'(exports, module) {
    'use strict'
    init_define_process()
    var replace = String.prototype.replace
    var percentTwenties = /%20/g
    var Format = {
      RFC1738: 'RFC1738',
      RFC3986: 'RFC3986',
    }
    module.exports = {
      default: Format.RFC3986,
      formatters: {
        RFC1738: function (value) {
          return replace.call(value, percentTwenties, '+')
        },
        RFC3986: function (value) {
          return String(value)
        },
      },
      RFC1738: Format.RFC1738,
      RFC3986: Format.RFC3986,
    }
  },
})

// node_modules/qs/lib/utils.js
var require_utils = __commonJS({
  'node_modules/qs/lib/utils.js'(exports, module) {
    'use strict'
    init_define_process()
    var formats = require_formats()
    var has = Object.prototype.hasOwnProperty
    var isArray = Array.isArray
    var hexTable = (function () {
      var array = []
      for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase())
      }
      return array
    })()
    var compactQueue = function compactQueue2(queue) {
      while (queue.length > 1) {
        var item = queue.pop()
        var obj = item.obj[item.prop]
        if (isArray(obj)) {
          var compacted = []
          for (var j = 0; j < obj.length; ++j) {
            if (typeof obj[j] !== 'undefined') {
              compacted.push(obj[j])
            }
          }
          item.obj[item.prop] = compacted
        }
      }
    }
    var arrayToObject = function arrayToObject2(source, options) {
      var obj = options && options.plainObjects ? /* @__PURE__ */ Object.create(null) : {}
      for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
          obj[i] = source[i]
        }
      }
      return obj
    }
    var merge = function merge2(target, source, options) {
      if (!source) {
        return target
      }
      if (typeof source !== 'object') {
        if (isArray(target)) {
          target.push(source)
        } else if (target && typeof target === 'object') {
          if ((options && (options.plainObjects || options.allowPrototypes)) || !has.call(Object.prototype, source)) {
            target[source] = true
          }
        } else {
          return [target, source]
        }
        return target
      }
      if (!target || typeof target !== 'object') {
        return [target].concat(source)
      }
      var mergeTarget = target
      if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options)
      }
      if (isArray(target) && isArray(source)) {
        source.forEach(function (item, i) {
          if (has.call(target, i)) {
            var targetItem = target[i]
            if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
              target[i] = merge2(targetItem, item, options)
            } else {
              target.push(item)
            }
          } else {
            target[i] = item
          }
        })
        return target
      }
      return Object.keys(source).reduce(function (acc, key) {
        var value = source[key]
        if (has.call(acc, key)) {
          acc[key] = merge2(acc[key], value, options)
        } else {
          acc[key] = value
        }
        return acc
      }, mergeTarget)
    }
    var assign = function assignSingleSource(target, source) {
      return Object.keys(source).reduce(function (acc, key) {
        acc[key] = source[key]
        return acc
      }, target)
    }
    var decode = function (str, decoder, charset) {
      var strWithoutPlus = str.replace(/\+/g, ' ')
      if (charset === 'iso-8859-1') {
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape)
      }
      try {
        return decodeURIComponent(strWithoutPlus)
      } catch (e) {
        return strWithoutPlus
      }
    }
    var encode = function encode2(str, defaultEncoder, charset, kind, format) {
      if (str.length === 0) {
        return str
      }
      var string = str
      if (typeof str === 'symbol') {
        string = Symbol.prototype.toString.call(str)
      } else if (typeof str !== 'string') {
        string = String(str)
      }
      if (charset === 'iso-8859-1') {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
          return '%26%23' + parseInt($0.slice(2), 16) + '%3B'
        })
      }
      var out = ''
      for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i)
        if (
          c === 45 ||
          c === 46 ||
          c === 95 ||
          c === 126 ||
          (c >= 48 && c <= 57) ||
          (c >= 65 && c <= 90) ||
          (c >= 97 && c <= 122) ||
          (format === formats.RFC1738 && (c === 40 || c === 41))
        ) {
          out += string.charAt(i)
          continue
        }
        if (c < 128) {
          out = out + hexTable[c]
          continue
        }
        if (c < 2048) {
          out = out + (hexTable[192 | (c >> 6)] + hexTable[128 | (c & 63)])
          continue
        }
        if (c < 55296 || c >= 57344) {
          out = out + (hexTable[224 | (c >> 12)] + hexTable[128 | ((c >> 6) & 63)] + hexTable[128 | (c & 63)])
          continue
        }
        i += 1
        c = 65536 + (((c & 1023) << 10) | (string.charCodeAt(i) & 1023))
        out +=
          hexTable[240 | (c >> 18)] +
          hexTable[128 | ((c >> 12) & 63)] +
          hexTable[128 | ((c >> 6) & 63)] +
          hexTable[128 | (c & 63)]
      }
      return out
    }
    var compact = function compact2(value) {
      var queue = [{ obj: { o: value }, prop: 'o' }]
      var refs = []
      for (var i = 0; i < queue.length; ++i) {
        var item = queue[i]
        var obj = item.obj[item.prop]
        var keys = Object.keys(obj)
        for (var j = 0; j < keys.length; ++j) {
          var key = keys[j]
          var val = obj[key]
          if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
            queue.push({ obj, prop: key })
            refs.push(val)
          }
        }
      }
      compactQueue(queue)
      return value
    }
    var isRegExp = function isRegExp2(obj) {
      return Object.prototype.toString.call(obj) === '[object RegExp]'
    }
    var isBuffer = function isBuffer2(obj) {
      if (!obj || typeof obj !== 'object') {
        return false
      }
      return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj))
    }
    var combine = function combine2(a, b) {
      return [].concat(a, b)
    }
    var maybeMap = function maybeMap2(val, fn) {
      if (isArray(val)) {
        var mapped = []
        for (var i = 0; i < val.length; i += 1) {
          mapped.push(fn(val[i]))
        }
        return mapped
      }
      return fn(val)
    }
    module.exports = {
      arrayToObject,
      assign,
      combine,
      compact,
      decode,
      encode,
      isBuffer,
      isRegExp,
      maybeMap,
      merge,
    }
  },
})

// node_modules/qs/lib/stringify.js
var require_stringify = __commonJS({
  'node_modules/qs/lib/stringify.js'(exports, module) {
    'use strict'
    init_define_process()
    var getSideChannel = require_side_channel()
    var utils = require_utils()
    var formats = require_formats()
    var has = Object.prototype.hasOwnProperty
    var arrayPrefixGenerators = {
      brackets: function brackets(prefix) {
        return prefix + '[]'
      },
      comma: 'comma',
      indices: function indices(prefix, key) {
        return prefix + '[' + key + ']'
      },
      repeat: function repeat(prefix) {
        return prefix
      },
    }
    var isArray = Array.isArray
    var push = Array.prototype.push
    var pushToArray = function (arr, valueOrArray) {
      push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray])
    }
    var toISO = Date.prototype.toISOString
    var defaultFormat = formats['default']
    var defaults = {
      addQueryPrefix: false,
      allowDots: false,
      charset: 'utf-8',
      charsetSentinel: false,
      delimiter: '&',
      encode: true,
      encoder: utils.encode,
      encodeValuesOnly: false,
      format: defaultFormat,
      formatter: formats.formatters[defaultFormat],
      indices: false,
      serializeDate: function serializeDate(date) {
        return toISO.call(date)
      },
      skipNulls: false,
      strictNullHandling: false,
    }
    var isNonNullishPrimitive = function isNonNullishPrimitive2(v) {
      return (
        typeof v === 'string' ||
        typeof v === 'number' ||
        typeof v === 'boolean' ||
        typeof v === 'symbol' ||
        typeof v === 'bigint'
      )
    }
    var stringify = function stringify2(
      object,
      prefix,
      generateArrayPrefix,
      strictNullHandling,
      skipNulls,
      encoder,
      filter,
      sort,
      allowDots,
      serializeDate,
      format,
      formatter,
      encodeValuesOnly,
      charset,
      sideChannel,
    ) {
      var obj = object
      if (sideChannel.has(object)) {
        throw new RangeError('Cyclic object value')
      }
      if (typeof filter === 'function') {
        obj = filter(prefix, obj)
      } else if (obj instanceof Date) {
        obj = serializeDate(obj)
      } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
        obj = utils.maybeMap(obj, function (value2) {
          if (value2 instanceof Date) {
            return serializeDate(value2)
          }
          return value2
        })
      }
      if (obj === null) {
        if (strictNullHandling) {
          return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key', format) : prefix
        }
        obj = ''
      }
      if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder) {
          var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key', format)
          return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value', format))]
        }
        return [formatter(prefix) + '=' + formatter(String(obj))]
      }
      var values = []
      if (typeof obj === 'undefined') {
        return values
      }
      var objKeys
      if (generateArrayPrefix === 'comma' && isArray(obj)) {
        objKeys = [{ value: obj.length > 0 ? obj.join(',') || null : void 0 }]
      } else if (isArray(filter)) {
        objKeys = filter
      } else {
        var keys = Object.keys(obj)
        objKeys = sort ? keys.sort(sort) : keys
      }
      for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i]
        var value = typeof key === 'object' && key.value !== void 0 ? key.value : obj[key]
        if (skipNulls && value === null) {
          continue
        }
        var keyPrefix = isArray(obj)
          ? typeof generateArrayPrefix === 'function'
            ? generateArrayPrefix(prefix, key)
            : prefix
          : prefix + (allowDots ? '.' + key : '[' + key + ']')
        sideChannel.set(object, true)
        var valueSideChannel = getSideChannel()
        pushToArray(
          values,
          stringify2(
            value,
            keyPrefix,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            format,
            formatter,
            encodeValuesOnly,
            charset,
            valueSideChannel,
          ),
        )
      }
      return values
    }
    var normalizeStringifyOptions = function normalizeStringifyOptions2(opts) {
      if (!opts) {
        return defaults
      }
      if (opts.encoder !== null && opts.encoder !== void 0 && typeof opts.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.')
      }
      var charset = opts.charset || defaults.charset
      if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined')
      }
      var format = formats['default']
      if (typeof opts.format !== 'undefined') {
        if (!has.call(formats.formatters, opts.format)) {
          throw new TypeError('Unknown format option provided.')
        }
        format = opts.format
      }
      var formatter = formats.formatters[format]
      var filter = defaults.filter
      if (typeof opts.filter === 'function' || isArray(opts.filter)) {
        filter = opts.filter
      }
      return {
        addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
        encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
        encodeValuesOnly:
          typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter,
        format,
        formatter,
        serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === 'function' ? opts.sort : null,
        strictNullHandling:
          typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
      }
    }
    module.exports = function (object, opts) {
      var obj = object
      var options = normalizeStringifyOptions(opts)
      var objKeys
      var filter
      if (typeof options.filter === 'function') {
        filter = options.filter
        obj = filter('', obj)
      } else if (isArray(options.filter)) {
        filter = options.filter
        objKeys = filter
      }
      var keys = []
      if (typeof obj !== 'object' || obj === null) {
        return ''
      }
      var arrayFormat
      if (opts && opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat
      } else if (opts && 'indices' in opts) {
        arrayFormat = opts.indices ? 'indices' : 'repeat'
      } else {
        arrayFormat = 'indices'
      }
      var generateArrayPrefix = arrayPrefixGenerators[arrayFormat]
      if (!objKeys) {
        objKeys = Object.keys(obj)
      }
      if (options.sort) {
        objKeys.sort(options.sort)
      }
      var sideChannel = getSideChannel()
      for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i]
        if (options.skipNulls && obj[key] === null) {
          continue
        }
        pushToArray(
          keys,
          stringify(
            obj[key],
            key,
            generateArrayPrefix,
            options.strictNullHandling,
            options.skipNulls,
            options.encode ? options.encoder : null,
            options.filter,
            options.sort,
            options.allowDots,
            options.serializeDate,
            options.format,
            options.formatter,
            options.encodeValuesOnly,
            options.charset,
            sideChannel,
          ),
        )
      }
      var joined = keys.join(options.delimiter)
      var prefix = options.addQueryPrefix === true ? '?' : ''
      if (options.charsetSentinel) {
        if (options.charset === 'iso-8859-1') {
          prefix += 'utf8=%26%2310003%3B&'
        } else {
          prefix += 'utf8=%E2%9C%93&'
        }
      }
      return joined.length > 0 ? prefix + joined : ''
    }
  },
})

// node_modules/qs/lib/parse.js
var require_parse = __commonJS({
  'node_modules/qs/lib/parse.js'(exports, module) {
    'use strict'
    init_define_process()
    var utils = require_utils()
    var has = Object.prototype.hasOwnProperty
    var isArray = Array.isArray
    var defaults = {
      allowDots: false,
      allowPrototypes: false,
      allowSparse: false,
      arrayLimit: 20,
      charset: 'utf-8',
      charsetSentinel: false,
      comma: false,
      decoder: utils.decode,
      delimiter: '&',
      depth: 5,
      ignoreQueryPrefix: false,
      interpretNumericEntities: false,
      parameterLimit: 1e3,
      parseArrays: true,
      plainObjects: false,
      strictNullHandling: false,
    }
    var interpretNumericEntities = function (str) {
      return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10))
      })
    }
    var parseArrayValue = function (val, options) {
      if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',')
      }
      return val
    }
    var isoSentinel = 'utf8=%26%2310003%3B'
    var charsetSentinel = 'utf8=%E2%9C%93'
    var parseValues = function parseQueryStringValues(str, options) {
      var obj = {}
      var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str
      var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit
      var parts = cleanStr.split(options.delimiter, limit)
      var skipIndex = -1
      var i
      var charset = options.charset
      if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
          if (parts[i].indexOf('utf8=') === 0) {
            if (parts[i] === charsetSentinel) {
              charset = 'utf-8'
            } else if (parts[i] === isoSentinel) {
              charset = 'iso-8859-1'
            }
            skipIndex = i
            i = parts.length
          }
        }
      }
      for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
          continue
        }
        var part = parts[i]
        var bracketEqualsPos = part.indexOf(']=')
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1
        var key, val
        if (pos === -1) {
          key = options.decoder(part, defaults.decoder, charset, 'key')
          val = options.strictNullHandling ? null : ''
        } else {
          key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key')
          val = utils.maybeMap(parseArrayValue(part.slice(pos + 1), options), function (encodedVal) {
            return options.decoder(encodedVal, defaults.decoder, charset, 'value')
          })
        }
        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
          val = interpretNumericEntities(val)
        }
        if (part.indexOf('[]=') > -1) {
          val = isArray(val) ? [val] : val
        }
        if (has.call(obj, key)) {
          obj[key] = utils.combine(obj[key], val)
        } else {
          obj[key] = val
        }
      }
      return obj
    }
    var parseObject = function (chain, val, options, valuesParsed) {
      var leaf = valuesParsed ? val : parseArrayValue(val, options)
      for (var i = chain.length - 1; i >= 0; --i) {
        var obj
        var root = chain[i]
        if (root === '[]' && options.parseArrays) {
          obj = [].concat(leaf)
        } else {
          obj = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {}
          var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root
          var index = parseInt(cleanRoot, 10)
          if (!options.parseArrays && cleanRoot === '') {
            obj = { 0: leaf }
          } else if (
            !isNaN(index) &&
            root !== cleanRoot &&
            String(index) === cleanRoot &&
            index >= 0 &&
            options.parseArrays &&
            index <= options.arrayLimit
          ) {
            obj = []
            obj[index] = leaf
          } else {
            obj[cleanRoot] = leaf
          }
        }
        leaf = obj
      }
      return leaf
    }
    var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
      if (!givenKey) {
        return
      }
      var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey
      var brackets = /(\[[^[\]]*])/
      var child = /(\[[^[\]]*])/g
      var segment = options.depth > 0 && brackets.exec(key)
      var parent = segment ? key.slice(0, segment.index) : key
      var keys = []
      if (parent) {
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
          if (!options.allowPrototypes) {
            return
          }
        }
        keys.push(parent)
      }
      var i = 0
      while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
        i += 1
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
          if (!options.allowPrototypes) {
            return
          }
        }
        keys.push(segment[1])
      }
      if (segment) {
        keys.push('[' + key.slice(segment.index) + ']')
      }
      return parseObject(keys, val, options, valuesParsed)
    }
    var normalizeParseOptions = function normalizeParseOptions2(opts) {
      if (!opts) {
        return defaults
      }
      if (opts.decoder !== null && opts.decoder !== void 0 && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.')
      }
      if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined')
      }
      var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset
      return {
        allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter:
          typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        depth: typeof opts.depth === 'number' || opts.depth === false ? +opts.depth : defaults.depth,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities:
          typeof opts.interpretNumericEntities === 'boolean'
            ? opts.interpretNumericEntities
            : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictNullHandling:
          typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
      }
    }
    module.exports = function (str, opts) {
      var options = normalizeParseOptions(opts)
      if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? /* @__PURE__ */ Object.create(null) : {}
      }
      var tempObj = typeof str === 'string' ? parseValues(str, options) : str
      var obj = options.plainObjects ? /* @__PURE__ */ Object.create(null) : {}
      var keys = Object.keys(tempObj)
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i]
        var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string')
        obj = utils.merge(obj, newObj, options)
      }
      if (options.allowSparse === true) {
        return obj
      }
      return utils.compact(obj)
    }
  },
})

// node_modules/qs/lib/index.js
var require_lib4 = __commonJS({
  'node_modules/qs/lib/index.js'(exports, module) {
    'use strict'
    init_define_process()
    var stringify = require_stringify()
    var parse = require_parse()
    var formats = require_formats()
    module.exports = {
      formats,
      parse,
      stringify,
    }
  },
})

// node_modules/then-request/lib/handle-qs.js
var require_handle_qs = __commonJS({
  'node_modules/then-request/lib/handle-qs.js'(exports) {
    'use strict'
    init_define_process()
    exports.__esModule = true
    var qs_1 = require_lib4()
    function handleQs(url, query) {
      var _a = url.split('?'),
        start = _a[0],
        part2 = _a[1]
      var qs = (part2 || '').split('#')[0]
      var end = part2 && part2.split('#').length > 1 ? '#' + part2.split('#')[1] : ''
      var baseQs = qs_1.parse(qs)
      for (var i in query) {
        baseQs[i] = query[i]
      }
      qs = qs_1.stringify(baseQs)
      if (qs !== '') {
        qs = '?' + qs
      }
      return start + qs + end
    }
    exports['default'] = handleQs
  },
})

// node_modules/then-request/lib/browser.js
var require_browser = __commonJS({
  'node_modules/then-request/lib/browser.js'(exports, module) {
    'use strict'
    init_define_process()
    var __assign =
      (exports && exports.__assign) ||
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    exports.__esModule = true
    var GenericResponse = require_lib2()
    var Promise2 = require_promise()
    var ResponsePromise_1 = require_ResponsePromise()
    exports.ResponsePromise = ResponsePromise_1.ResponsePromise
    var handle_qs_1 = require_handle_qs()
    function request(method, url, options) {
      return ResponsePromise_1['default'](
        new Promise2(function (resolve, reject) {
          var xhr = new XMLHttpRequest()
          if (typeof method !== 'string') {
            throw new TypeError('The method must be a string.')
          }
          if (typeof url !== 'string') {
            throw new TypeError('The URL/path must be a string.')
          }
          if (options == null) {
            options = {}
          }
          if (typeof options !== 'object') {
            throw new TypeError('Options must be an object (or null).')
          }
          method = method.toUpperCase()
          function attempt(n, options2) {
            request(method, url, {
              qs: options2.qs,
              headers: options2.headers,
              timeout: options2.timeout,
            }).nodeify(function (err, res) {
              var retry = !!(err || res.statusCode >= 400)
              if (typeof options2.retry === 'function') {
                retry = options2.retry(err, res, n + 1)
              }
              if (n >= (options2.maxRetries || 5)) {
                retry = false
              }
              if (retry) {
                var delay = options2.retryDelay
                if (typeof options2.retryDelay === 'function') {
                  delay = options2.retryDelay(err, res, n + 1)
                }
                delay = delay || 200
                setTimeout(function () {
                  attempt(n + 1, options2)
                }, delay)
              } else {
                if (err) reject(err)
                else resolve(res)
              }
            })
          }
          if (options.retry && method === 'GET') {
            return attempt(0, options)
          }
          var headers = options.headers || {}
          var match
          var crossDomain = !!((match = /^([\w-]+:)?\/\/([^\/]+)/.exec(url)) && match[2] != location.host)
          if (!crossDomain) {
            headers = __assign({}, headers, { 'X-Requested-With': 'XMLHttpRequest' })
          }
          if (options.qs) {
            url = handle_qs_1['default'](url, options.qs)
          }
          if (options.json) {
            options.body = JSON.stringify(options.json)
            headers = __assign({}, headers, { 'Content-Type': 'application/json' })
          }
          if (options.form) {
            options.body = options.form
          }
          if (options.timeout) {
            xhr.timeout = options.timeout
            var start_1 = Date.now()
            xhr.ontimeout = function () {
              var duration = Date.now() - start_1
              var err = new Error('Request timed out after ' + duration + 'ms')
              err.timeout = true
              err.duration = duration
              reject(err)
            }
          }
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              var headers2 = {}
              xhr
                .getAllResponseHeaders()
                .split('\r\n')
                .forEach(function (header) {
                  var h = header.split(':')
                  if (h.length > 1) {
                    headers2[h[0].toLowerCase()] = h.slice(1).join(':').trim()
                  }
                })
              var res = new GenericResponse(xhr.status, headers2, xhr.responseText, url)
              resolve(res)
            }
          }
          xhr.open(method, url, true)
          for (var name in headers) {
            xhr.setRequestHeader(name, headers[name])
          }
          xhr.send(options.body ? options.body : null)
        }),
      )
    }
    var fd = FormData
    exports.FormData = fd
    exports['default'] = request
    module.exports = request
    module.exports['default'] = request
    module.exports.FormData = fd
  },
})

// utils/files.js
var require_files = __commonJS({
  'utils/files.js'(exports, module) {
    init_define_process()
    var fs = require_fs()
    var request = require_browser()
    var readFile = function (fileName) {
      return new Promise((resolve) => {
        fs.readFile(fileName, 'utf8', (err, data) => {
          define_process_default.nextTick(() => resolve(data))
        })
      })
    }
    var readHTTPSFile = function (url) {
      return request('GET', url).then((res) => res.getBody())
    }
    module.exports = {
      readFile,
      readHTTPSFile,
    }
  },
})

// common/schema/loader.js
var require_loader = __commonJS({
  'common/schema/loader.js'(exports, module) {
    init_define_process()
    var xml2js = require_xml2js()
    var files = require_files()
    var { generateIssue } = require_issues()
    var { fallbackFilePath, fallbackDirectory, localSchemaList } = require_config()
    var loadSchema = function (schemaDef = null, useFallback = true, reportNoFallbackError = true) {
      const schemaPromise = loadPromise(schemaDef)
      if (schemaPromise === null) {
        return Promise.reject([generateIssue('invalidSchemaSpecification', { spec: JSON.stringify(schemaDef) })])
      }
      return schemaPromise
        .then((xmlData) => [xmlData, []])
        .catch((issues) => {
          if (useFallback) {
            issues.push(generateIssue('requestedSchemaLoadFailedFallbackUsed', { spec: JSON.stringify(schemaDef) }))
            return loadLocalSchema(fallbackFilePath)
              .then((xmlData) => [xmlData, issues])
              .catch((fallbackIssues) => {
                fallbackIssues.push(generateIssue('fallbackSchemaLoadFailed', {}))
                return Promise.reject(issues.concat(fallbackIssues))
              })
          } else {
            if (reportNoFallbackError) {
              issues.push(generateIssue('requestedSchemaLoadFailedNoFallbackUsed', { spec: JSON.stringify(schemaDef) }))
            }
            return Promise.reject(issues)
          }
        })
    }
    var loadSchemaFromSpec = function (schemaDef = null) {
      const schemaPromise = loadPromise(schemaDef)
      if (schemaPromise === null) {
        return Promise.reject([generateIssue('invalidSchemaSpecification', { spec: JSON.stringify(schemaDef) })])
      }
      return schemaPromise.then((xmlData) => [xmlData, []])
    }
    var loadPromise = function (schemaDef) {
      if (schemaDef === null) {
        return null
      } else if (schemaDef.path) {
        return loadLocalSchema(schemaDef.path)
      } else {
        const localName = schemaDef.localName
        if (localSchemaList.has(localName)) {
          const filePath = __require('../../data/' + localName + '.xml')
          return loadLocalSchema(filePath)
        } else {
          return loadRemoteSchema(schemaDef)
        }
      }
    }
    var loadRemoteSchema = function (schemaDef) {
      let url
      if (schemaDef.library) {
        url = `https://raw.githubusercontent.com/hed-standard/hed-schema-library/main/library_schemas/${schemaDef.library}/hedxml/HED_${schemaDef.library}_${schemaDef.version}.xml`
      } else {
        url = `https://raw.githubusercontent.com/hed-standard/hed-specification/master/hedxml/HED${schemaDef.version}.xml`
      }
      return loadSchemaFile(files.readHTTPSFile(url), 'remoteSchemaLoadFailed', { spec: JSON.stringify(schemaDef) })
    }
    var loadLocalSchema = function (path) {
      return loadSchemaFile(files.readFile(path), 'localSchemaLoadFailed', { path })
    }
    var loadSchemaFile = function (xmlDataPromise, issueCode, issueArgs) {
      return xmlDataPromise.then(parseSchemaXML).catch((error) => {
        issueArgs.error = error.message
        return Promise.reject([generateIssue(issueCode, issueArgs)])
      })
    }
    var parseSchemaXML = function (data) {
      return xml2js.parseStringPromise(data, { explicitCharkey: true })
    }
    module.exports = {
      loadSchemaFromSpec,
      loadSchema,
    }
  },
})

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  'node_modules/semver/internal/debug.js'(exports, module) {
    init_define_process()
    var debug =
      typeof define_process_default === 'object' &&
      define_process_default.env &&
      define_process_default.env.NODE_DEBUG &&
      /\bsemver\b/i.test(define_process_default.env.NODE_DEBUG)
        ? (...args) => console.error('SEMVER', ...args)
        : () => {}
    module.exports = debug
  },
})

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  'node_modules/semver/internal/constants.js'(exports, module) {
    init_define_process()
    var SEMVER_SPEC_VERSION = '2.0.0'
    var MAX_LENGTH = 256
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991
    var MAX_SAFE_COMPONENT_LENGTH = 16
    module.exports = {
      SEMVER_SPEC_VERSION,
      MAX_LENGTH,
      MAX_SAFE_INTEGER,
      MAX_SAFE_COMPONENT_LENGTH,
    }
  },
})

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  'node_modules/semver/internal/re.js'(exports, module) {
    init_define_process()
    var { MAX_SAFE_COMPONENT_LENGTH } = require_constants()
    var debug = require_debug()
    exports = module.exports = {}
    var re = (exports.re = [])
    var src = (exports.src = [])
    var t = (exports.t = {})
    var R = 0
    var createToken = (name, value, isGlobal) => {
      const index = R++
      debug(index, value)
      t[name] = index
      src[index] = value
      re[index] = new RegExp(value, isGlobal ? 'g' : void 0)
    }
    createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*')
    createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+')
    createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*')
    createToken(
      'MAINVERSION',
      `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`,
    )
    createToken(
      'MAINVERSIONLOOSE',
      `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`,
    )
    createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`)
    createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`)
    createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`)
    createToken(
      'PRERELEASELOOSE',
      `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`,
    )
    createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+')
    createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`)
    createToken('FULLPLAIN', `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`)
    createToken('FULL', `^${src[t.FULLPLAIN]}$`)
    createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`)
    createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`)
    createToken('GTLT', '((?:<|>)?=?)')
    createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`)
    createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`)
    createToken(
      'XRANGEPLAIN',
      `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${
        src[t.PRERELEASE]
      })?${src[t.BUILD]}?)?)?`,
    )
    createToken(
      'XRANGEPLAINLOOSE',
      `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${
        src[t.XRANGEIDENTIFIERLOOSE]
      })(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`,
    )
    createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`)
    createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`)
    createToken(
      'COERCE',
      `${'(^|[^\\d])(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:$|[^\\d])`,
    )
    createToken('COERCERTL', src[t.COERCE], true)
    createToken('LONETILDE', '(?:~>?)')
    createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true)
    exports.tildeTrimReplace = '$1~'
    createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
    createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)
    createToken('LONECARET', '(?:\\^)')
    createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true)
    exports.caretTrimReplace = '$1^'
    createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
    createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)
    createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
    createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)
    createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)
    exports.comparatorTrimReplace = '$1$2$3'
    createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`)
    createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`)
    createToken('STAR', '(<|>)?=?\\s*\\*')
    createToken('GTE0', '^\\s*>=\\s*0.0.0\\s*$')
    createToken('GTE0PRE', '^\\s*>=\\s*0.0.0-0\\s*$')
  },
})

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  'node_modules/semver/internal/parse-options.js'(exports, module) {
    init_define_process()
    var opts = ['includePrerelease', 'loose', 'rtl']
    var parseOptions = (options) =>
      !options
        ? {}
        : typeof options !== 'object'
        ? { loose: true }
        : opts
            .filter((k) => options[k])
            .reduce((options2, k) => {
              options2[k] = true
              return options2
            }, {})
    module.exports = parseOptions
  },
})

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  'node_modules/semver/internal/identifiers.js'(exports, module) {
    init_define_process()
    var numeric = /^[0-9]+$/
    var compareIdentifiers = (a, b) => {
      const anum = numeric.test(a)
      const bnum = numeric.test(b)
      if (anum && bnum) {
        a = +a
        b = +b
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1
    }
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a)
    module.exports = {
      compareIdentifiers,
      rcompareIdentifiers,
    }
  },
})

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  'node_modules/semver/classes/semver.js'(exports, module) {
    init_define_process()
    var debug = require_debug()
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants()
    var { re, t } = require_re()
    var parseOptions = require_parse_options()
    var { compareIdentifiers } = require_identifiers()
    var SemVer = class {
      constructor(version, options) {
        options = parseOptions(options)
        if (version instanceof SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version
          } else {
            version = version.version
          }
        } else if (typeof version !== 'string') {
          throw new TypeError(`Invalid Version: ${version}`)
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(`version is longer than ${MAX_LENGTH} characters`)
        }
        debug('SemVer', version, options)
        this.options = options
        this.loose = !!options.loose
        this.includePrerelease = !!options.includePrerelease
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL])
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`)
        }
        this.raw = version
        this.major = +m[1]
        this.minor = +m[2]
        this.patch = +m[3]
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError('Invalid major version')
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError('Invalid minor version')
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError('Invalid patch version')
        }
        if (!m[4]) {
          this.prerelease = []
        } else {
          this.prerelease = m[4].split('.').map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num
              }
            }
            return id
          })
        }
        this.build = m[5] ? m[5].split('.') : []
        this.format()
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join('.')}`
        }
        return this.version
      }
      toString() {
        return this.version
      }
      compare(other) {
        debug('SemVer.compare', this.version, this.options, other)
        if (!(other instanceof SemVer)) {
          if (typeof other === 'string' && other === this.version) {
            return 0
          }
          other = new SemVer(other, this.options)
        }
        if (other.version === this.version) {
          return 0
        }
        return this.compareMain(other) || this.comparePre(other)
      }
      compareMain(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options)
        }
        return (
          compareIdentifiers(this.major, other.major) ||
          compareIdentifiers(this.minor, other.minor) ||
          compareIdentifiers(this.patch, other.patch)
        )
      }
      comparePre(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options)
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0
        }
        let i = 0
        do {
          const a = this.prerelease[i]
          const b = other.prerelease[i]
          debug('prerelease compare', i, a, b)
          if (a === void 0 && b === void 0) {
            return 0
          } else if (b === void 0) {
            return 1
          } else if (a === void 0) {
            return -1
          } else if (a === b) {
            continue
          } else {
            return compareIdentifiers(a, b)
          }
        } while (++i)
      }
      compareBuild(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options)
        }
        let i = 0
        do {
          const a = this.build[i]
          const b = other.build[i]
          debug('prerelease compare', i, a, b)
          if (a === void 0 && b === void 0) {
            return 0
          } else if (b === void 0) {
            return 1
          } else if (a === void 0) {
            return -1
          } else if (a === b) {
            continue
          } else {
            return compareIdentifiers(a, b)
          }
        } while (++i)
      }
      inc(release, identifier) {
        switch (release) {
          case 'premajor':
            this.prerelease.length = 0
            this.patch = 0
            this.minor = 0
            this.major++
            this.inc('pre', identifier)
            break
          case 'preminor':
            this.prerelease.length = 0
            this.patch = 0
            this.minor++
            this.inc('pre', identifier)
            break
          case 'prepatch':
            this.prerelease.length = 0
            this.inc('patch', identifier)
            this.inc('pre', identifier)
            break
          case 'prerelease':
            if (this.prerelease.length === 0) {
              this.inc('patch', identifier)
            }
            this.inc('pre', identifier)
            break
          case 'major':
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++
            }
            this.minor = 0
            this.patch = 0
            this.prerelease = []
            break
          case 'minor':
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++
            }
            this.patch = 0
            this.prerelease = []
            break
          case 'patch':
            if (this.prerelease.length === 0) {
              this.patch++
            }
            this.prerelease = []
            break
          case 'pre':
            if (this.prerelease.length === 0) {
              this.prerelease = [0]
            } else {
              let i = this.prerelease.length
              while (--i >= 0) {
                if (typeof this.prerelease[i] === 'number') {
                  this.prerelease[i]++
                  i = -2
                }
              }
              if (i === -1) {
                this.prerelease.push(0)
              }
            }
            if (identifier) {
              if (this.prerelease[0] === identifier) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = [identifier, 0]
                }
              } else {
                this.prerelease = [identifier, 0]
              }
            }
            break
          default:
            throw new Error(`invalid increment argument: ${release}`)
        }
        this.format()
        this.raw = this.version
        return this
      }
    }
    module.exports = SemVer
  },
})

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  'node_modules/semver/functions/compare.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose))
    module.exports = compare
  },
})

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  'node_modules/semver/functions/lt.js'(exports, module) {
    init_define_process()
    var compare = require_compare()
    var lt = (a, b, loose) => compare(a, b, loose) < 0
    module.exports = lt
  },
})

// node_modules/pluralize/pluralize.js
var require_pluralize = __commonJS({
  'node_modules/pluralize/pluralize.js'(exports, module) {
    init_define_process()
    ;(function (root, pluralize) {
      if (typeof __require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        module.exports = pluralize()
      } else if (typeof define === 'function' && define.amd) {
        define(function () {
          return pluralize()
        })
      } else {
        root.pluralize = pluralize()
      }
    })(exports, function () {
      var pluralRules = []
      var singularRules = []
      var uncountables = {}
      var irregularPlurals = {}
      var irregularSingles = {}
      function sanitizeRule(rule) {
        if (typeof rule === 'string') {
          return new RegExp('^' + rule + '$', 'i')
        }
        return rule
      }
      function restoreCase(word, token) {
        if (word === token) return token
        if (word === word.toLowerCase()) return token.toLowerCase()
        if (word === word.toUpperCase()) return token.toUpperCase()
        if (word[0] === word[0].toUpperCase()) {
          return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase()
        }
        return token.toLowerCase()
      }
      function interpolate(str, args) {
        return str.replace(/\$(\d{1,2})/g, function (match, index) {
          return args[index] || ''
        })
      }
      function replace(word, rule) {
        return word.replace(rule[0], function (match, index) {
          var result = interpolate(rule[1], arguments)
          if (match === '') {
            return restoreCase(word[index - 1], result)
          }
          return restoreCase(match, result)
        })
      }
      function sanitizeWord(token, word, rules) {
        if (!token.length || uncountables.hasOwnProperty(token)) {
          return word
        }
        var len = rules.length
        while (len--) {
          var rule = rules[len]
          if (rule[0].test(word)) return replace(word, rule)
        }
        return word
      }
      function replaceWord(replaceMap, keepMap, rules) {
        return function (word) {
          var token = word.toLowerCase()
          if (keepMap.hasOwnProperty(token)) {
            return restoreCase(word, token)
          }
          if (replaceMap.hasOwnProperty(token)) {
            return restoreCase(word, replaceMap[token])
          }
          return sanitizeWord(token, word, rules)
        }
      }
      function checkWord(replaceMap, keepMap, rules, bool) {
        return function (word) {
          var token = word.toLowerCase()
          if (keepMap.hasOwnProperty(token)) return true
          if (replaceMap.hasOwnProperty(token)) return false
          return sanitizeWord(token, token, rules) === token
        }
      }
      function pluralize(word, count, inclusive) {
        var pluralized = count === 1 ? pluralize.singular(word) : pluralize.plural(word)
        return (inclusive ? count + ' ' : '') + pluralized
      }
      pluralize.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules)
      pluralize.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules)
      pluralize.singular = replaceWord(irregularPlurals, irregularSingles, singularRules)
      pluralize.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules)
      pluralize.addPluralRule = function (rule, replacement) {
        pluralRules.push([sanitizeRule(rule), replacement])
      }
      pluralize.addSingularRule = function (rule, replacement) {
        singularRules.push([sanitizeRule(rule), replacement])
      }
      pluralize.addUncountableRule = function (word) {
        if (typeof word === 'string') {
          uncountables[word.toLowerCase()] = true
          return
        }
        pluralize.addPluralRule(word, '$0')
        pluralize.addSingularRule(word, '$0')
      }
      pluralize.addIrregularRule = function (single, plural) {
        plural = plural.toLowerCase()
        single = single.toLowerCase()
        irregularSingles[single] = plural
        irregularPlurals[plural] = single
      }
      ;[
        ['I', 'we'],
        ['me', 'us'],
        ['he', 'they'],
        ['she', 'they'],
        ['them', 'them'],
        ['myself', 'ourselves'],
        ['yourself', 'yourselves'],
        ['itself', 'themselves'],
        ['herself', 'themselves'],
        ['himself', 'themselves'],
        ['themself', 'themselves'],
        ['is', 'are'],
        ['was', 'were'],
        ['has', 'have'],
        ['this', 'these'],
        ['that', 'those'],
        ['echo', 'echoes'],
        ['dingo', 'dingoes'],
        ['volcano', 'volcanoes'],
        ['tornado', 'tornadoes'],
        ['torpedo', 'torpedoes'],
        ['genus', 'genera'],
        ['viscus', 'viscera'],
        ['stigma', 'stigmata'],
        ['stoma', 'stomata'],
        ['dogma', 'dogmata'],
        ['lemma', 'lemmata'],
        ['schema', 'schemata'],
        ['anathema', 'anathemata'],
        ['ox', 'oxen'],
        ['axe', 'axes'],
        ['die', 'dice'],
        ['yes', 'yeses'],
        ['foot', 'feet'],
        ['eave', 'eaves'],
        ['goose', 'geese'],
        ['tooth', 'teeth'],
        ['quiz', 'quizzes'],
        ['human', 'humans'],
        ['proof', 'proofs'],
        ['carve', 'carves'],
        ['valve', 'valves'],
        ['looey', 'looies'],
        ['thief', 'thieves'],
        ['groove', 'grooves'],
        ['pickaxe', 'pickaxes'],
        ['passerby', 'passersby'],
      ].forEach(function (rule) {
        return pluralize.addIrregularRule(rule[0], rule[1])
      })
      ;[
        [/s?$/i, 's'],
        [/[^\u0000-\u007F]$/i, '$0'],
        [/([^aeiou]ese)$/i, '$1'],
        [/(ax|test)is$/i, '$1es'],
        [/(alias|[^aou]us|t[lm]as|gas|ris)$/i, '$1es'],
        [/(e[mn]u)s?$/i, '$1s'],
        [/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/i, '$1'],
        [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1i'],
        [/(alumn|alg|vertebr)(?:a|ae)$/i, '$1ae'],
        [/(seraph|cherub)(?:im)?$/i, '$1im'],
        [/(her|at|gr)o$/i, '$1oes'],
        [
          /(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/i,
          '$1a',
        ],
        [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/i, '$1a'],
        [/sis$/i, 'ses'],
        [/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/i, '$1$2ves'],
        [/([^aeiouy]|qu)y$/i, '$1ies'],
        [/([^ch][ieo][ln])ey$/i, '$1ies'],
        [/(x|ch|ss|sh|zz)$/i, '$1es'],
        [/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/i, '$1ices'],
        [/\b((?:tit)?m|l)(?:ice|ouse)$/i, '$1ice'],
        [/(pe)(?:rson|ople)$/i, '$1ople'],
        [/(child)(?:ren)?$/i, '$1ren'],
        [/eaux$/i, '$0'],
        [/m[ae]n$/i, 'men'],
        ['thou', 'you'],
      ].forEach(function (rule) {
        return pluralize.addPluralRule(rule[0], rule[1])
      })
      ;[
        [/s$/i, ''],
        [/(ss)$/i, '$1'],
        [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
        [/(ar|(?:wo|[ae])l|[eo][ao])ves$/i, '$1f'],
        [/ies$/i, 'y'],
        [/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/i, '$1ie'],
        [/\b(mon|smil)ies$/i, '$1ey'],
        [/\b((?:tit)?m|l)ice$/i, '$1ouse'],
        [/(seraph|cherub)im$/i, '$1'],
        [/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/i, '$1'],
        [/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/i, '$1sis'],
        [/(movie|twelve|abuse|e[mn]u)s$/i, '$1'],
        [/(test)(?:is|es)$/i, '$1is'],
        [/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/i, '$1us'],
        [
          /(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/i,
          '$1um',
        ],
        [/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/i, '$1on'],
        [/(alumn|alg|vertebr)ae$/i, '$1a'],
        [/(cod|mur|sil|vert|ind)ices$/i, '$1ex'],
        [/(matr|append)ices$/i, '$1ix'],
        [/(pe)(rson|ople)$/i, '$1rson'],
        [/(child)ren$/i, '$1'],
        [/(eau)x?$/i, '$1'],
        [/men$/i, 'man'],
      ].forEach(function (rule) {
        return pluralize.addSingularRule(rule[0], rule[1])
      })
      ;[
        'adulthood',
        'advice',
        'agenda',
        'aid',
        'aircraft',
        'alcohol',
        'ammo',
        'analytics',
        'anime',
        'athletics',
        'audio',
        'bison',
        'blood',
        'bream',
        'buffalo',
        'butter',
        'carp',
        'cash',
        'chassis',
        'chess',
        'clothing',
        'cod',
        'commerce',
        'cooperation',
        'corps',
        'debris',
        'diabetes',
        'digestion',
        'elk',
        'energy',
        'equipment',
        'excretion',
        'expertise',
        'firmware',
        'flounder',
        'fun',
        'gallows',
        'garbage',
        'graffiti',
        'hardware',
        'headquarters',
        'health',
        'herpes',
        'highjinks',
        'homework',
        'housework',
        'information',
        'jeans',
        'justice',
        'kudos',
        'labour',
        'literature',
        'machinery',
        'mackerel',
        'mail',
        'media',
        'mews',
        'moose',
        'music',
        'mud',
        'manga',
        'news',
        'only',
        'personnel',
        'pike',
        'plankton',
        'pliers',
        'police',
        'pollution',
        'premises',
        'rain',
        'research',
        'rice',
        'salmon',
        'scissors',
        'series',
        'sewage',
        'shambles',
        'shrimp',
        'software',
        'species',
        'staff',
        'swine',
        'tennis',
        'traffic',
        'transportation',
        'trout',
        'tuna',
        'wealth',
        'welfare',
        'whiting',
        'wildebeest',
        'wildlife',
        'you',
        /pok[eé]mon$/i,
        /[^aeiou]ese$/i,
        /deer$/i,
        /fish$/i,
        /measles$/i,
        /o[iu]s$/i,
        /pox$/i,
        /sheep$/i,
      ].forEach(pluralize.addUncountableRule)
      return pluralize
    })
  },
})

// utils/hedStrings.js
var require_hedStrings = __commonJS({
  'utils/hedStrings.js'(exports, module) {
    init_define_process()
    var pluralize = require_pluralize()
    pluralize.addUncountableRule('hertz')
    var { isNumber } = require_string()
    var unitPrefixType = 'unitPrefix'
    var unitSymbolType = 'unitSymbol'
    var SIUnitKey = 'SIUnit'
    var SIUnitModifierKey = 'SIUnitModifier'
    var SIUnitSymbolModifierKey = 'SIUnitSymbolModifier'
    var replaceTagNameWithPound = function (formattedTag) {
      const lastTagSlashIndex = formattedTag.lastIndexOf('/')
      if (lastTagSlashIndex !== -1) {
        return formattedTag.substring(0, lastTagSlashIndex) + '/#'
      } else {
        return '#'
      }
    }
    var getTagSlashIndices = function (tag) {
      const indices = []
      let i = -1
      while ((i = tag.indexOf('/', i + 1)) >= 0) {
        indices.push(i)
      }
      return indices
    }
    var getTagName = function (tag, character = '/') {
      const lastSlashIndex = tag.lastIndexOf(character)
      if (lastSlashIndex === -1) {
        return tag
      } else {
        return tag.substring(lastSlashIndex + 1)
      }
    }
    var getParentTag = function (tag, character = '/') {
      const lastSlashIndex = tag.lastIndexOf(character)
      if (lastSlashIndex === -1) {
        return tag
      } else {
        return tag.substring(0, lastSlashIndex)
      }
    }
    var openingGroupCharacter = '('
    var closingGroupCharacter = ')'
    var hedStringIsAGroup = function (hedString) {
      const trimmedHedString = hedString.trim()
      return trimmedHedString.startsWith(openingGroupCharacter) && trimmedHedString.endsWith(closingGroupCharacter)
    }
    var removeGroupParentheses = function (tagGroup) {
      return tagGroup.slice(1, -1)
    }
    var hed2ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_; :]+$/
    var hed3ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_; ]+$/
    var validateValue = function (value, isNumeric, isHed3) {
      if (value === '#') {
        return true
      }
      if (isNumeric) {
        return isNumber(value)
      }
      if (isHed3) {
        return hed3ValidValueCharacters.test(value)
      } else {
        return hed2ValidValueCharacters.test(value)
      }
    }
    var isPrefixUnit = function (unit, hedSchemaAttributes) {
      if (unitPrefixType in hedSchemaAttributes.unitAttributes) {
        return hedSchemaAttributes.unitAttributes[unitPrefixType][unit] || false
      } else {
        return unit === '$'
      }
    }
    var getValidDerivativeUnits = function (unit, hedSchemaAttributes) {
      const pluralUnits = [unit]
      const isUnitSymbol = hedSchemaAttributes.unitAttributes[unitSymbolType][unit] !== void 0
      if (hedSchemaAttributes.hasUnitModifiers && !isUnitSymbol) {
        pluralUnits.push(pluralize.plural(unit))
      }
      const isSIUnit = hedSchemaAttributes.unitAttributes[SIUnitKey][unit] !== void 0
      if (isSIUnit && hedSchemaAttributes.hasUnitModifiers) {
        const derivativeUnits = [].concat(pluralUnits)
        const modifierKey = isUnitSymbol ? SIUnitSymbolModifierKey : SIUnitModifierKey
        for (const unitModifier in hedSchemaAttributes.unitModifiers[modifierKey]) {
          for (const plural of pluralUnits) {
            derivativeUnits.push(unitModifier + plural)
          }
        }
        return derivativeUnits
      } else {
        return pluralUnits
      }
    }
    var validateUnits = function (originalTagUnitValue, tagUnitClassUnits, hedSchemaAttributes) {
      const validUnits = getAllUnits(hedSchemaAttributes)
      validUnits.sort((first, second) => {
        return second.length - first.length
      })
      let actualUnit = getTagName(originalTagUnitValue, ' ')
      let noUnitFound = false
      if (actualUnit === originalTagUnitValue) {
        actualUnit = ''
        noUnitFound = true
      }
      let foundUnit, foundWrongCaseUnit, strippedValue
      for (const unit of validUnits) {
        const isUnitSymbol = hedSchemaAttributes.unitAttributes[unitSymbolType][unit] !== void 0
        const derivativeUnits = getValidDerivativeUnits(unit, hedSchemaAttributes)
        for (const derivativeUnit of derivativeUnits) {
          if (isPrefixUnit(unit, hedSchemaAttributes) && originalTagUnitValue.startsWith(derivativeUnit)) {
            foundUnit = true
            noUnitFound = false
            strippedValue = originalTagUnitValue.substring(derivativeUnit.length).trim()
          }
          if (actualUnit === derivativeUnit) {
            foundUnit = true
            strippedValue = getParentTag(originalTagUnitValue, ' ')
          } else if (actualUnit.toLowerCase() === derivativeUnit.toLowerCase()) {
            if (isUnitSymbol) {
              foundWrongCaseUnit = true
            } else {
              foundUnit = true
            }
            strippedValue = getParentTag(originalTagUnitValue, ' ')
          }
          if (foundUnit) {
            const unitIsValid = tagUnitClassUnits.includes(unit)
            return [true, unitIsValid, strippedValue]
          }
        }
        if (foundWrongCaseUnit) {
          return [true, false, strippedValue]
        }
      }
      return [!noUnitFound, false, originalTagUnitValue]
    }
    var getAllUnits = function (hedSchemaAttributes) {
      const units = []
      for (const unitClass in hedSchemaAttributes.unitClasses) {
        const unitClassUnits = hedSchemaAttributes.unitClasses[unitClass]
        Array.prototype.push.apply(units, unitClassUnits)
      }
      return units
    }
    module.exports = {
      replaceTagNameWithPound,
      getTagSlashIndices,
      getTagName,
      getParentTag,
      hedStringIsAGroup,
      removeGroupParentheses,
      validateValue,
      validateUnits,
    }
  },
})

// utils/types.js
var require_types2 = __commonJS({
  'utils/types.js'(exports, module) {
    init_define_process()
    var MemoizerMixin = (Base) => {
      return class extends Base {
        constructor(...args) {
          super(...args)
          this._memoizedProperties = /* @__PURE__ */ new Map()
        }
        _memoize(propertyName, valueComputer) {
          if (!propertyName) {
            throw new Error('Invalid property name in Memoizer subclass.')
          }
          if (this._memoizedProperties.has(propertyName)) {
            return this._memoizedProperties.get(propertyName)
          }
          const value = valueComputer()
          this._memoizedProperties.set(propertyName, value)
          return value
        }
      }
    }
    var Memoizer = class extends MemoizerMixin(Object) {}
    module.exports = {
      Memoizer,
      MemoizerMixin,
    }
  },
})

// validator/parser/parsedHedSubstring.js
var require_parsedHedSubstring = __commonJS({
  'validator/parser/parsedHedSubstring.js'(exports, module) {
    init_define_process()
    var { Memoizer } = require_types2()
    var ParsedHedSubstring = class extends Memoizer {
      constructor(originalTag, originalBounds) {
        super()
        this.originalTag = originalTag
        this.originalBounds = originalBounds
      }
    }
    module.exports = ParsedHedSubstring
  },
})

// validator/parser/parsedHedTag.js
var require_parsedHedTag = __commonJS({
  'validator/parser/parsedHedTag.js'(exports, module) {
    init_define_process()
    var { generateIssue } = require_issues()
    var { convertPartialHedStringToLong } = require_converter()
    var { getTagSlashIndices, replaceTagNameWithPound } = require_hedStrings()
    var ParsedHedSubstring = require_parsedHedSubstring()
    var ParsedHedTag = class extends ParsedHedSubstring {
      constructor(originalTag, hedString, originalBounds, hedSchemas, schemaName = '') {
        super(originalTag, originalBounds)
        this.convertTag(hedString, hedSchemas, schemaName)
        this.formattedTag = this.formatTag()
      }
      convertTag(hedString, hedSchemas, schemaName) {
        if (hedSchemas.isSyntaxOnly) {
          this.canonicalTag = this.originalTag
          this.conversionIssues = []
          return
        }
        this.schema = hedSchemas.getSchema(schemaName)
        if (this.schema === void 0) {
          if (schemaName !== '') {
            this.conversionIssues = [
              generateIssue('unmatchedLibrarySchema', {
                tag: this.originalTag,
                library: schemaName,
              }),
            ]
          } else {
            this.conversionIssues = [
              generateIssue('unmatchedBaseSchema', {
                tag: this.originalTag,
              }),
            ]
          }
          this.canonicalTag = this.originalTag
          return
        }
        const [canonicalTag, conversionIssues] = convertPartialHedStringToLong(
          this.schema,
          this.originalTag,
          hedString,
          this.originalBounds[0],
        )
        this.canonicalTag = canonicalTag
        this.conversionIssues = conversionIssues
      }
      formatTag() {
        this.originalTag = this.originalTag.replace('\n', ' ')
        let hedTagString = this.canonicalTag.trim()
        if (hedTagString.startsWith('"')) {
          hedTagString = hedTagString.slice(1)
        }
        if (hedTagString.endsWith('"')) {
          hedTagString = hedTagString.slice(0, -1)
        }
        if (hedTagString.startsWith('/')) {
          hedTagString = hedTagString.slice(1)
        }
        if (hedTagString.endsWith('/')) {
          hedTagString = hedTagString.slice(0, -1)
        }
        return hedTagString.toLowerCase()
      }
      hasAttribute(attribute) {
        return this.schema.tagHasAttribute(this.formattedTag, attribute)
      }
      parentHasAttribute(attribute) {
        return this.schema.tagHasAttribute(this.parentFormattedTag, attribute)
      }
      static getTagName(tagString) {
        const lastSlashIndex = tagString.lastIndexOf('/')
        if (lastSlashIndex === -1) {
          return tagString
        } else {
          return tagString.substring(lastSlashIndex + 1)
        }
      }
      get formattedTagName() {
        return this._memoize('formattedTagName', () => {
          return ParsedHedTag.getTagName(this.formattedTag)
        })
      }
      get originalTagName() {
        return this._memoize('originalTagName', () => {
          return ParsedHedTag.getTagName(this.originalTag)
        })
      }
      static getParentTag(tagString) {
        const lastSlashIndex = tagString.lastIndexOf('/')
        if (lastSlashIndex === -1) {
          return tagString
        } else {
          return tagString.substring(0, lastSlashIndex)
        }
      }
      get parentCanonicalTag() {
        return this._memoize('parentCanonicalTag', () => {
          return ParsedHedTag.getParentTag(this.canonicalTag)
        })
      }
      get parentFormattedTag() {
        return this._memoize('parentFormattedTag', () => {
          return ParsedHedTag.getParentTag(this.formattedTag)
        })
      }
      get parentOriginalTag() {
        return this._memoize('parentOriginalTag', () => {
          return ParsedHedTag.getParentTag(this.originalTag)
        })
      }
      static *ancestorIterator(tagString) {
        while (tagString.lastIndexOf('/') >= 0) {
          yield tagString
          tagString = ParsedHedTag.getParentTag(tagString)
        }
        yield tagString
      }
      isDescendantOf(parent) {
        if (parent instanceof ParsedHedTag) {
          parent = parent.formattedTag
        }
        for (const ancestor of ParsedHedTag.ancestorIterator(this.formattedTag)) {
          if (ancestor === parent) {
            return true
          }
        }
        return false
      }
      get allowsExtensions() {
        return this._memoize('allowsExtensions', () => {
          const extensionAllowedAttribute = 'extensionAllowed'
          if (this.hasAttribute(extensionAllowedAttribute)) {
            return true
          }
          const tagSlashIndices = getTagSlashIndices(this.formattedTag)
          for (const tagSlashIndex of tagSlashIndices) {
            const tagSubstring = this.formattedTag.slice(0, tagSlashIndex)
            if (this.schema.tagHasAttribute(tagSubstring, extensionAllowedAttribute)) {
              return true
            }
          }
          return false
        })
      }
      equivalent(other) {
        return other instanceof ParsedHedTag && this.formattedTag === other.formattedTag
      }
    }
    var ParsedHed2Tag = class extends ParsedHedTag {
      get existsInSchema() {
        return this._memoize('existsInSchema', () => {
          return this.schema.attributes.tags.includes(this.formattedTag)
        })
      }
      get takesValueFormattedTag() {
        return this._memoize('takesValueFormattedTag', () => {
          return replaceTagNameWithPound(this.formattedTag)
        })
      }
      get takesValue() {
        return this._memoize('takesValue', () => {
          return this.schema.tagHasAttribute(this.takesValueFormattedTag, 'takesValue')
        })
      }
      get hasUnitClass() {
        return this._memoize('hasUnitClass', () => {
          if (!this.schema.attributes.hasUnitClasses) {
            return false
          }
          return this.takesValueFormattedTag in this.schema.attributes.tagUnitClasses
        })
      }
      get unitClasses() {
        return this._memoize('unitClasses', () => {
          if (this.hasUnitClass) {
            return this.schema.attributes.tagUnitClasses[this.takesValueFormattedTag]
          } else {
            return []
          }
        })
      }
      get defaultUnit() {
        return this._memoize('defaultUnit', () => {
          const defaultUnitForTagAttribute = 'default'
          const defaultUnitsForUnitClassAttribute = 'defaultUnits'
          if (!this.hasUnitClass) {
            return ''
          }
          const takesValueTag = this.takesValueFormattedTag
          let hasDefaultAttribute = this.schema.tagHasAttribute(takesValueTag, defaultUnitForTagAttribute)
          if (hasDefaultAttribute) {
            return this.schema.attributes.tagAttributes[defaultUnitForTagAttribute][takesValueTag]
          }
          hasDefaultAttribute = this.schema.tagHasAttribute(takesValueTag, defaultUnitsForUnitClassAttribute)
          if (hasDefaultAttribute) {
            return this.schema.attributes.tagAttributes[defaultUnitsForUnitClassAttribute][takesValueTag]
          }
          const unitClasses = this.schema.attributes.tagUnitClasses[takesValueTag]
          const firstUnitClass = unitClasses[0]
          return this.schema.attributes.unitClassAttributes[firstUnitClass][defaultUnitsForUnitClassAttribute][0]
        })
      }
      get validUnits() {
        return this._memoize('validUnits', () => {
          const tagUnitClasses = this.unitClasses
          const units = []
          for (const unitClass of tagUnitClasses) {
            const unitClassUnits = this.schema.attributes.unitClasses[unitClass]
            units.push(...unitClassUnits)
          }
          return units
        })
      }
    }
    var ParsedHed3Tag = class extends ParsedHedTag {
      get existsInSchema() {
        return this._memoize('existsInSchema', () => {
          return this.schema.entries.definitions.get('tags').hasEntry(this.formattedTag)
        })
      }
      get takesValueFormattedTag() {
        return this._memoize('takesValueFormattedTag', () => {
          const takesValueType = 'takesValue'
          for (const ancestor of ParsedHedTag.ancestorIterator(this.formattedTag)) {
            const takesValueTag = replaceTagNameWithPound(ancestor)
            if (this.schema.tagHasAttribute(takesValueTag, takesValueType)) {
              return takesValueTag
            }
          }
          return null
        })
      }
      get takesValue() {
        return this._memoize('takesValue', () => {
          return this.takesValueFormattedTag !== null
        })
      }
      get hasUnitClass() {
        return this._memoize('hasUnitClass', () => {
          if (!this.schema.entries.definitions.has('unitClasses')) {
            return false
          }
          if (this.takesValueTag === null) {
            return false
          }
          return this.takesValueTag.hasUnitClasses
        })
      }
      get unitClasses() {
        return this._memoize('unitClasses', () => {
          if (this.hasUnitClass) {
            return this.takesValueTag.unitClasses
          } else {
            return []
          }
        })
      }
      get defaultUnit() {
        return this._memoize('defaultUnit', () => {
          const defaultUnitsForUnitClassAttribute = 'defaultUnits'
          if (!this.hasUnitClass) {
            return ''
          }
          const tagDefaultUnit = this.takesValueTag.getNamedAttributeValue(defaultUnitsForUnitClassAttribute)
          if (tagDefaultUnit) {
            return tagDefaultUnit
          }
          const firstUnitClass = this.unitClasses[0]
          return firstUnitClass.getNamedAttributeValue(defaultUnitsForUnitClassAttribute)
        })
      }
      get validUnits() {
        return this._memoize('validUnits', () => {
          const tagUnitClasses = this.unitClasses
          const units = /* @__PURE__ */ new Set()
          for (const unitClass of tagUnitClasses) {
            const unitClassUnits = this.schema.entries.unitClassMap.get(unitClass.name).units
            for (const unit of unitClassUnits.values()) {
              units.add(unit)
            }
          }
          return units
        })
      }
      get takesValueTag() {
        return this._memoize('takesValueTag', () => {
          if (this.takesValueFormattedTag !== null) {
            return this.schema.entries.definitions.get('tags').getEntry(this.takesValueFormattedTag)
          } else {
            return null
          }
        })
      }
    }
    module.exports = {
      ParsedHedTag,
      ParsedHed2Tag,
      ParsedHed3Tag,
    }
  },
})

// utils/hedData.js
var require_hedData = __commonJS({
  'utils/hedData.js'(exports, module) {
    init_define_process()
    var lt = require_lt()
    var { ParsedHedTag } = require_parsedHedTag()
    var getGenerationForSchemaVersion = function (version) {
      if (lt(version, '4.0.0')) {
        return 1
      } else if (lt(version, '8.0.0-alpha')) {
        return 2
      } else {
        return 3
      }
    }
    var mergeParsingIssues = function (previousIssues, currentIssues) {
      for (const key of Object.keys(currentIssues)) {
        previousIssues[key] =
          previousIssues[key] !== void 0 ? previousIssues[key].concat(currentIssues[key]) : currentIssues[key]
      }
    }
    var getParsedParentTags = function (hedSchemas, shortTag) {
      const parentTags = /* @__PURE__ */ new Map()
      for (const [schemaNickname, schema] of hedSchemas.schemas) {
        const parentTag = new ParsedHedTag(shortTag, shortTag, [0, shortTag.length - 1], hedSchemas, schemaNickname)
        parentTags.set(schema, parentTag)
        parentTag.conversionIssues = parentTag.conversionIssues.filter((issue) => issue.internalCode !== 'invalidTag')
      }
      return parentTags
    }
    module.exports = {
      getGenerationForSchemaVersion,
      mergeParsingIssues,
      getParsedParentTags,
    }
  },
})

// common/schema/types.js
var require_types3 = __commonJS({
  'common/schema/types.js'(exports, module) {
    init_define_process()
    var { getGenerationForSchemaVersion } = require_hedData()
    var Schema = class {
      constructor(xmlData, attributes, mapping) {
        this.xmlData = xmlData
        const rootElement = xmlData.HED
        this.version = rootElement.$.version
        this.library = rootElement.$.library || ''
        this.attributes = attributes
        this.mapping = mapping
        if (this.library) {
          this.generation = 3
        } else {
          this.generation = getGenerationForSchemaVersion(this.version)
        }
      }
      get isHed2() {
        return this.generation === 2
      }
      get isHed3() {
        return this.generation === 3
      }
      tagHasAttribute(tag, tagAttribute) {}
    }
    var Hed2Schema = class extends Schema {
      tagHasAttribute(tag, tagAttribute) {
        return this.attributes.tagHasAttribute(tag, tagAttribute)
      }
    }
    var Hed3Schema = class extends Schema {
      constructor(xmlData, entries, mapping) {
        super(xmlData, null, mapping)
        this.entries = entries
      }
      tagHasAttribute(tag, tagAttribute) {
        return this.entries.tagHasAttribute(tag, tagAttribute)
      }
    }
    var Schemas = class {
      constructor(schemas) {
        if (schemas === null || schemas instanceof Map) {
          this.schemas = schemas
        } else if (schemas instanceof Schema) {
          this.schemas = /* @__PURE__ */ new Map([['', schemas]])
        } else {
          throw new Error('Invalid type passed to Schemas constructor')
        }
      }
      getSchema(schemaName) {
        if (this.schemas === null || !this.schemas.has(schemaName)) {
          return null
        } else {
          return this.schemas.get(schemaName)
        }
      }
      get baseSchema() {
        return this.getSchema('')
      }
      get librarySchemas() {
        if (this.schemas !== null) {
          const schemasCopy = new Map(this.schemas)
          schemasCopy.delete('')
          return schemasCopy
        } else {
          return null
        }
      }
      get generation() {
        if (this.schemas === null || this.schemas.size === 0) {
          return 0
        } else if (this.librarySchemas.size > 0) {
          return 3
        } else if (this.baseSchema) {
          return this.baseSchema.generation
        } else {
          return 0
        }
      }
      get isSyntaxOnly() {
        return this.generation === 0
      }
      get isHed2() {
        return this.generation === 2
      }
      get isHed3() {
        return this.generation === 3
      }
    }
    var SchemaSpec = class {
      constructor(nickname, version, library = '', localPath = '') {
        this.nickname = nickname
        this.version = version
        this.library = library
        this.localPath = localPath
      }
      get localName() {
        if (!this.library) {
          return 'HED' + this.version
        } else {
          return 'HED_' + this.library + '_' + this.version
        }
      }
      get path() {
        return this.localPath
      }
    }
    var SchemasSpec = class {
      constructor() {
        this.data = /* @__PURE__ */ new Map()
      }
      addSchemaSpec(schemaSpec) {
        this.data.set(schemaSpec.nickname, schemaSpec)
        return this
      }
      isDuplicate(schemaSpec) {
        return this.data.has(schemaSpec.nickname)
      }
    }
    module.exports = {
      Schema,
      Hed2Schema,
      Hed3Schema,
      Schemas,
      SchemaSpec,
      SchemasSpec,
    }
  },
})

// common/schema/index.js
var require_schema = __commonJS({
  'common/schema/index.js'(exports, module) {
    init_define_process()
    var config = require_config()
    var loadSchema = require_loader()
    var { Schema, Schemas } = require_types3()
    module.exports = {
      loadSchema,
      Schema,
      Schemas,
      config,
    }
  },
})

// utils/xml2js.js
var require_xml2js2 = __commonJS({
  'utils/xml2js.js'(exports, module) {
    init_define_process()
    var setNodeParent = function (node, parent) {
      if ('$parent' in node) {
        return
      }
      node.$parent = parent
      const childNodes = node.node || []
      for (const child of childNodes) {
        setNodeParent(child, node)
      }
    }
    var setParent = function (node, parent) {
      if (node.schema) {
        node.$parent = null
        setNodeParent(node.schema[0], null)
      } else {
        setNodeParent(node, parent)
      }
    }
    module.exports = {
      setParent,
    }
  },
})

// converter/schema.js
var require_schema2 = __commonJS({
  'converter/schema.js'(exports, module) {
    init_define_process()
    var xpath = require_xpath()
    var schemaUtils = require_schema()
    var { asArray } = require_array()
    var { setParent } = require_xml2js2()
    var types = require_types()
    var TagEntry = types.TagEntry
    var Mapping = types.Mapping
    var buildMappingObject = function (xmlData) {
      const nodeData = /* @__PURE__ */ new Map()
      const tagElementData = /* @__PURE__ */ new Map()
      let hasNoDuplicates = true
      const rootElement = xmlData.HED
      setParent(rootElement, null)
      const tagElements = xpath.find(rootElement, '//node')
      for (const tagElement of tagElements) {
        if (getElementTagValue(tagElement) === '#') {
          tagElementData.get(tagElement.$parent).takesValue = true
          continue
        }
        const tagPath = getTagPathFromTagElement(tagElement)
        const shortPath = tagPath[0]
        const cleanedShortPath = shortPath.toLowerCase()
        tagPath.reverse()
        const longPath = tagPath.join('/')
        const tagObject = new TagEntry(shortPath, longPath)
        tagElementData.set(tagElement, tagObject)
        if (!nodeData.has(cleanedShortPath)) {
          nodeData.set(cleanedShortPath, tagObject)
        } else {
          hasNoDuplicates = false
          const duplicateArray = asArray(nodeData.get(cleanedShortPath))
          duplicateArray.push(tagObject)
          nodeData.set(cleanedShortPath, duplicateArray)
        }
      }
      return new Mapping(nodeData, hasNoDuplicates)
    }
    var getTagPathFromTagElement = function (tagElement) {
      const ancestorTags = [getElementTagValue(tagElement)]
      let parentTagName = getParentTagName(tagElement)
      let parentElement = tagElement.$parent
      while (parentTagName) {
        ancestorTags.push(parentTagName)
        parentTagName = getParentTagName(parentElement)
        parentElement = parentElement.$parent
      }
      return ancestorTags
    }
    var getElementTagValue = function (element, tagName = 'name') {
      return element[tagName][0]._
    }
    var getParentTagName = function (tagElement) {
      const parentTagElement = tagElement.$parent
      if (parentTagElement && 'name' in parentTagElement) {
        return parentTagElement.name[0]._
      } else {
        return ''
      }
    }
    var buildSchema = function (schemaDef = {}) {
      return schemaUtils.loadSchema(schemaDef).then(([xmlData, issues]) => {
        const mapping = buildMappingObject(xmlData)
        const baseSchema = new schemaUtils.Schema(xmlData, null, mapping)
        return new schemaUtils.Schemas(baseSchema)
      })
    }
    module.exports = {
      buildSchema,
      buildMappingObject,
    }
  },
})

// converter/index.js
var require_converter2 = __commonJS({
  'converter/index.js'(exports, module) {
    init_define_process()
    var { convertHedStringToLong, convertHedStringToShort } = require_converter()
    var { buildSchema } = require_schema2()
    module.exports = {
      buildSchema,
      convertHedStringToShort,
      convertHedStringToLong,
    }
  },
})

// utils/index.js
var require_utils2 = __commonJS({
  'utils/index.js'(exports, module) {
    init_define_process()
    var HED = require_hedStrings()
    var array = require_array()
    var files = require_files()
    var string = require_string()
    module.exports = {
      HED,
      array,
      files,
      string,
    }
  },
})

// node_modules/lodash/_freeGlobal.js
var require_freeGlobal = __commonJS({
  'node_modules/lodash/_freeGlobal.js'(exports, module) {
    init_define_process()
    var freeGlobal = typeof globalThis == 'object' && globalThis && globalThis.Object === Object && globalThis
    module.exports = freeGlobal
  },
})

// node_modules/lodash/_root.js
var require_root = __commonJS({
  'node_modules/lodash/_root.js'(exports, module) {
    init_define_process()
    var freeGlobal = require_freeGlobal()
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self
    var root = freeGlobal || freeSelf || Function('return this')()
    module.exports = root
  },
})

// node_modules/lodash/_Symbol.js
var require_Symbol = __commonJS({
  'node_modules/lodash/_Symbol.js'(exports, module) {
    init_define_process()
    var root = require_root()
    var Symbol2 = root.Symbol
    module.exports = Symbol2
  },
})

// node_modules/lodash/_getRawTag.js
var require_getRawTag = __commonJS({
  'node_modules/lodash/_getRawTag.js'(exports, module) {
    init_define_process()
    var Symbol2 = require_Symbol()
    var objectProto = Object.prototype
    var hasOwnProperty = objectProto.hasOwnProperty
    var nativeObjectToString = objectProto.toString
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag]
      try {
        value[symToStringTag] = void 0
        var unmasked = true
      } catch (e) {}
      var result = nativeObjectToString.call(value)
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag
        } else {
          delete value[symToStringTag]
        }
      }
      return result
    }
    module.exports = getRawTag
  },
})

// node_modules/lodash/_objectToString.js
var require_objectToString = __commonJS({
  'node_modules/lodash/_objectToString.js'(exports, module) {
    init_define_process()
    var objectProto = Object.prototype
    var nativeObjectToString = objectProto.toString
    function objectToString(value) {
      return nativeObjectToString.call(value)
    }
    module.exports = objectToString
  },
})

// node_modules/lodash/_baseGetTag.js
var require_baseGetTag = __commonJS({
  'node_modules/lodash/_baseGetTag.js'(exports, module) {
    init_define_process()
    var Symbol2 = require_Symbol()
    var getRawTag = require_getRawTag()
    var objectToString = require_objectToString()
    var nullTag = '[object Null]'
    var undefinedTag = '[object Undefined]'
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value)
    }
    module.exports = baseGetTag
  },
})

// node_modules/lodash/isObject.js
var require_isObject = __commonJS({
  'node_modules/lodash/isObject.js'(exports, module) {
    init_define_process()
    function isObject(value) {
      var type = typeof value
      return value != null && (type == 'object' || type == 'function')
    }
    module.exports = isObject
  },
})

// node_modules/lodash/isFunction.js
var require_isFunction = __commonJS({
  'node_modules/lodash/isFunction.js'(exports, module) {
    init_define_process()
    var baseGetTag = require_baseGetTag()
    var isObject = require_isObject()
    var asyncTag = '[object AsyncFunction]'
    var funcTag = '[object Function]'
    var genTag = '[object GeneratorFunction]'
    var proxyTag = '[object Proxy]'
    function isFunction(value) {
      if (!isObject(value)) {
        return false
      }
      var tag = baseGetTag(value)
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag
    }
    module.exports = isFunction
  },
})

// node_modules/lodash/_coreJsData.js
var require_coreJsData = __commonJS({
  'node_modules/lodash/_coreJsData.js'(exports, module) {
    init_define_process()
    var root = require_root()
    var coreJsData = root['__core-js_shared__']
    module.exports = coreJsData
  },
})

// node_modules/lodash/_isMasked.js
var require_isMasked = __commonJS({
  'node_modules/lodash/_isMasked.js'(exports, module) {
    init_define_process()
    var coreJsData = require_coreJsData()
    var maskSrcKey = (function () {
      var uid = /[^.]+$/.exec((coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO) || '')
      return uid ? 'Symbol(src)_1.' + uid : ''
    })()
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func
    }
    module.exports = isMasked
  },
})

// node_modules/lodash/_toSource.js
var require_toSource = __commonJS({
  'node_modules/lodash/_toSource.js'(exports, module) {
    init_define_process()
    var funcProto = Function.prototype
    var funcToString = funcProto.toString
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func)
        } catch (e) {}
        try {
          return func + ''
        } catch (e) {}
      }
      return ''
    }
    module.exports = toSource
  },
})

// node_modules/lodash/_baseIsNative.js
var require_baseIsNative = __commonJS({
  'node_modules/lodash/_baseIsNative.js'(exports, module) {
    init_define_process()
    var isFunction = require_isFunction()
    var isMasked = require_isMasked()
    var isObject = require_isObject()
    var toSource = require_toSource()
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g
    var reIsHostCtor = /^\[object .+?Constructor\]$/
    var funcProto = Function.prototype
    var objectProto = Object.prototype
    var funcToString = funcProto.toString
    var hasOwnProperty = objectProto.hasOwnProperty
    var reIsNative = RegExp(
      '^' +
        funcToString
          .call(hasOwnProperty)
          .replace(reRegExpChar, '\\$&')
          .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') +
        '$',
    )
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor
      return pattern.test(toSource(value))
    }
    module.exports = baseIsNative
  },
})

// node_modules/lodash/_getValue.js
var require_getValue = __commonJS({
  'node_modules/lodash/_getValue.js'(exports, module) {
    init_define_process()
    function getValue(object, key) {
      return object == null ? void 0 : object[key]
    }
    module.exports = getValue
  },
})

// node_modules/lodash/_getNative.js
var require_getNative = __commonJS({
  'node_modules/lodash/_getNative.js'(exports, module) {
    init_define_process()
    var baseIsNative = require_baseIsNative()
    var getValue = require_getValue()
    function getNative(object, key) {
      var value = getValue(object, key)
      return baseIsNative(value) ? value : void 0
    }
    module.exports = getNative
  },
})

// node_modules/lodash/_nativeCreate.js
var require_nativeCreate = __commonJS({
  'node_modules/lodash/_nativeCreate.js'(exports, module) {
    init_define_process()
    var getNative = require_getNative()
    var nativeCreate = getNative(Object, 'create')
    module.exports = nativeCreate
  },
})

// node_modules/lodash/_hashClear.js
var require_hashClear = __commonJS({
  'node_modules/lodash/_hashClear.js'(exports, module) {
    init_define_process()
    var nativeCreate = require_nativeCreate()
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {}
      this.size = 0
    }
    module.exports = hashClear
  },
})

// node_modules/lodash/_hashDelete.js
var require_hashDelete = __commonJS({
  'node_modules/lodash/_hashDelete.js'(exports, module) {
    init_define_process()
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key]
      this.size -= result ? 1 : 0
      return result
    }
    module.exports = hashDelete
  },
})

// node_modules/lodash/_hashGet.js
var require_hashGet = __commonJS({
  'node_modules/lodash/_hashGet.js'(exports, module) {
    init_define_process()
    var nativeCreate = require_nativeCreate()
    var HASH_UNDEFINED = '__lodash_hash_undefined__'
    var objectProto = Object.prototype
    var hasOwnProperty = objectProto.hasOwnProperty
    function hashGet(key) {
      var data = this.__data__
      if (nativeCreate) {
        var result = data[key]
        return result === HASH_UNDEFINED ? void 0 : result
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0
    }
    module.exports = hashGet
  },
})

// node_modules/lodash/_hashHas.js
var require_hashHas = __commonJS({
  'node_modules/lodash/_hashHas.js'(exports, module) {
    init_define_process()
    var nativeCreate = require_nativeCreate()
    var objectProto = Object.prototype
    var hasOwnProperty = objectProto.hasOwnProperty
    function hashHas(key) {
      var data = this.__data__
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key)
    }
    module.exports = hashHas
  },
})

// node_modules/lodash/_hashSet.js
var require_hashSet = __commonJS({
  'node_modules/lodash/_hashSet.js'(exports, module) {
    init_define_process()
    var nativeCreate = require_nativeCreate()
    var HASH_UNDEFINED = '__lodash_hash_undefined__'
    function hashSet(key, value) {
      var data = this.__data__
      this.size += this.has(key) ? 0 : 1
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value
      return this
    }
    module.exports = hashSet
  },
})

// node_modules/lodash/_Hash.js
var require_Hash = __commonJS({
  'node_modules/lodash/_Hash.js'(exports, module) {
    init_define_process()
    var hashClear = require_hashClear()
    var hashDelete = require_hashDelete()
    var hashGet = require_hashGet()
    var hashHas = require_hashHas()
    var hashSet = require_hashSet()
    function Hash(entries) {
      var index = -1,
        length = entries == null ? 0 : entries.length
      this.clear()
      while (++index < length) {
        var entry = entries[index]
        this.set(entry[0], entry[1])
      }
    }
    Hash.prototype.clear = hashClear
    Hash.prototype['delete'] = hashDelete
    Hash.prototype.get = hashGet
    Hash.prototype.has = hashHas
    Hash.prototype.set = hashSet
    module.exports = Hash
  },
})

// node_modules/lodash/_listCacheClear.js
var require_listCacheClear = __commonJS({
  'node_modules/lodash/_listCacheClear.js'(exports, module) {
    init_define_process()
    function listCacheClear() {
      this.__data__ = []
      this.size = 0
    }
    module.exports = listCacheClear
  },
})

// node_modules/lodash/eq.js
var require_eq = __commonJS({
  'node_modules/lodash/eq.js'(exports, module) {
    init_define_process()
    function eq(value, other) {
      return value === other || (value !== value && other !== other)
    }
    module.exports = eq
  },
})

// node_modules/lodash/_assocIndexOf.js
var require_assocIndexOf = __commonJS({
  'node_modules/lodash/_assocIndexOf.js'(exports, module) {
    init_define_process()
    var eq = require_eq()
    function assocIndexOf(array, key) {
      var length = array.length
      while (length--) {
        if (eq(array[length][0], key)) {
          return length
        }
      }
      return -1
    }
    module.exports = assocIndexOf
  },
})

// node_modules/lodash/_listCacheDelete.js
var require_listCacheDelete = __commonJS({
  'node_modules/lodash/_listCacheDelete.js'(exports, module) {
    init_define_process()
    var assocIndexOf = require_assocIndexOf()
    var arrayProto = Array.prototype
    var splice = arrayProto.splice
    function listCacheDelete(key) {
      var data = this.__data__,
        index = assocIndexOf(data, key)
      if (index < 0) {
        return false
      }
      var lastIndex = data.length - 1
      if (index == lastIndex) {
        data.pop()
      } else {
        splice.call(data, index, 1)
      }
      --this.size
      return true
    }
    module.exports = listCacheDelete
  },
})

// node_modules/lodash/_listCacheGet.js
var require_listCacheGet = __commonJS({
  'node_modules/lodash/_listCacheGet.js'(exports, module) {
    init_define_process()
    var assocIndexOf = require_assocIndexOf()
    function listCacheGet(key) {
      var data = this.__data__,
        index = assocIndexOf(data, key)
      return index < 0 ? void 0 : data[index][1]
    }
    module.exports = listCacheGet
  },
})

// node_modules/lodash/_listCacheHas.js
var require_listCacheHas = __commonJS({
  'node_modules/lodash/_listCacheHas.js'(exports, module) {
    init_define_process()
    var assocIndexOf = require_assocIndexOf()
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1
    }
    module.exports = listCacheHas
  },
})

// node_modules/lodash/_listCacheSet.js
var require_listCacheSet = __commonJS({
  'node_modules/lodash/_listCacheSet.js'(exports, module) {
    init_define_process()
    var assocIndexOf = require_assocIndexOf()
    function listCacheSet(key, value) {
      var data = this.__data__,
        index = assocIndexOf(data, key)
      if (index < 0) {
        ++this.size
        data.push([key, value])
      } else {
        data[index][1] = value
      }
      return this
    }
    module.exports = listCacheSet
  },
})

// node_modules/lodash/_ListCache.js
var require_ListCache = __commonJS({
  'node_modules/lodash/_ListCache.js'(exports, module) {
    init_define_process()
    var listCacheClear = require_listCacheClear()
    var listCacheDelete = require_listCacheDelete()
    var listCacheGet = require_listCacheGet()
    var listCacheHas = require_listCacheHas()
    var listCacheSet = require_listCacheSet()
    function ListCache(entries) {
      var index = -1,
        length = entries == null ? 0 : entries.length
      this.clear()
      while (++index < length) {
        var entry = entries[index]
        this.set(entry[0], entry[1])
      }
    }
    ListCache.prototype.clear = listCacheClear
    ListCache.prototype['delete'] = listCacheDelete
    ListCache.prototype.get = listCacheGet
    ListCache.prototype.has = listCacheHas
    ListCache.prototype.set = listCacheSet
    module.exports = ListCache
  },
})

// node_modules/lodash/_Map.js
var require_Map = __commonJS({
  'node_modules/lodash/_Map.js'(exports, module) {
    init_define_process()
    var getNative = require_getNative()
    var root = require_root()
    var Map2 = getNative(root, 'Map')
    module.exports = Map2
  },
})

// node_modules/lodash/_mapCacheClear.js
var require_mapCacheClear = __commonJS({
  'node_modules/lodash/_mapCacheClear.js'(exports, module) {
    init_define_process()
    var Hash = require_Hash()
    var ListCache = require_ListCache()
    var Map2 = require_Map()
    function mapCacheClear() {
      this.size = 0
      this.__data__ = {
        hash: new Hash(),
        map: new (Map2 || ListCache)(),
        string: new Hash(),
      }
    }
    module.exports = mapCacheClear
  },
})

// node_modules/lodash/_isKeyable.js
var require_isKeyable = __commonJS({
  'node_modules/lodash/_isKeyable.js'(exports, module) {
    init_define_process()
    function isKeyable(value) {
      var type = typeof value
      return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean'
        ? value !== '__proto__'
        : value === null
    }
    module.exports = isKeyable
  },
})

// node_modules/lodash/_getMapData.js
var require_getMapData = __commonJS({
  'node_modules/lodash/_getMapData.js'(exports, module) {
    init_define_process()
    var isKeyable = require_isKeyable()
    function getMapData(map, key) {
      var data = map.__data__
      return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map
    }
    module.exports = getMapData
  },
})

// node_modules/lodash/_mapCacheDelete.js
var require_mapCacheDelete = __commonJS({
  'node_modules/lodash/_mapCacheDelete.js'(exports, module) {
    init_define_process()
    var getMapData = require_getMapData()
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key)
      this.size -= result ? 1 : 0
      return result
    }
    module.exports = mapCacheDelete
  },
})

// node_modules/lodash/_mapCacheGet.js
var require_mapCacheGet = __commonJS({
  'node_modules/lodash/_mapCacheGet.js'(exports, module) {
    init_define_process()
    var getMapData = require_getMapData()
    function mapCacheGet(key) {
      return getMapData(this, key).get(key)
    }
    module.exports = mapCacheGet
  },
})

// node_modules/lodash/_mapCacheHas.js
var require_mapCacheHas = __commonJS({
  'node_modules/lodash/_mapCacheHas.js'(exports, module) {
    init_define_process()
    var getMapData = require_getMapData()
    function mapCacheHas(key) {
      return getMapData(this, key).has(key)
    }
    module.exports = mapCacheHas
  },
})

// node_modules/lodash/_mapCacheSet.js
var require_mapCacheSet = __commonJS({
  'node_modules/lodash/_mapCacheSet.js'(exports, module) {
    init_define_process()
    var getMapData = require_getMapData()
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
        size = data.size
      data.set(key, value)
      this.size += data.size == size ? 0 : 1
      return this
    }
    module.exports = mapCacheSet
  },
})

// node_modules/lodash/_MapCache.js
var require_MapCache = __commonJS({
  'node_modules/lodash/_MapCache.js'(exports, module) {
    init_define_process()
    var mapCacheClear = require_mapCacheClear()
    var mapCacheDelete = require_mapCacheDelete()
    var mapCacheGet = require_mapCacheGet()
    var mapCacheHas = require_mapCacheHas()
    var mapCacheSet = require_mapCacheSet()
    function MapCache(entries) {
      var index = -1,
        length = entries == null ? 0 : entries.length
      this.clear()
      while (++index < length) {
        var entry = entries[index]
        this.set(entry[0], entry[1])
      }
    }
    MapCache.prototype.clear = mapCacheClear
    MapCache.prototype['delete'] = mapCacheDelete
    MapCache.prototype.get = mapCacheGet
    MapCache.prototype.has = mapCacheHas
    MapCache.prototype.set = mapCacheSet
    module.exports = MapCache
  },
})

// node_modules/lodash/_setCacheAdd.js
var require_setCacheAdd = __commonJS({
  'node_modules/lodash/_setCacheAdd.js'(exports, module) {
    init_define_process()
    var HASH_UNDEFINED = '__lodash_hash_undefined__'
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED)
      return this
    }
    module.exports = setCacheAdd
  },
})

// node_modules/lodash/_setCacheHas.js
var require_setCacheHas = __commonJS({
  'node_modules/lodash/_setCacheHas.js'(exports, module) {
    init_define_process()
    function setCacheHas(value) {
      return this.__data__.has(value)
    }
    module.exports = setCacheHas
  },
})

// node_modules/lodash/_SetCache.js
var require_SetCache = __commonJS({
  'node_modules/lodash/_SetCache.js'(exports, module) {
    init_define_process()
    var MapCache = require_MapCache()
    var setCacheAdd = require_setCacheAdd()
    var setCacheHas = require_setCacheHas()
    function SetCache(values) {
      var index = -1,
        length = values == null ? 0 : values.length
      this.__data__ = new MapCache()
      while (++index < length) {
        this.add(values[index])
      }
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd
    SetCache.prototype.has = setCacheHas
    module.exports = SetCache
  },
})

// node_modules/lodash/_baseFindIndex.js
var require_baseFindIndex = __commonJS({
  'node_modules/lodash/_baseFindIndex.js'(exports, module) {
    init_define_process()
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
        index = fromIndex + (fromRight ? 1 : -1)
      while (fromRight ? index-- : ++index < length) {
        if (predicate(array[index], index, array)) {
          return index
        }
      }
      return -1
    }
    module.exports = baseFindIndex
  },
})

// node_modules/lodash/_baseIsNaN.js
var require_baseIsNaN = __commonJS({
  'node_modules/lodash/_baseIsNaN.js'(exports, module) {
    init_define_process()
    function baseIsNaN(value) {
      return value !== value
    }
    module.exports = baseIsNaN
  },
})

// node_modules/lodash/_strictIndexOf.js
var require_strictIndexOf = __commonJS({
  'node_modules/lodash/_strictIndexOf.js'(exports, module) {
    init_define_process()
    function strictIndexOf(array, value, fromIndex) {
      var index = fromIndex - 1,
        length = array.length
      while (++index < length) {
        if (array[index] === value) {
          return index
        }
      }
      return -1
    }
    module.exports = strictIndexOf
  },
})

// node_modules/lodash/_baseIndexOf.js
var require_baseIndexOf = __commonJS({
  'node_modules/lodash/_baseIndexOf.js'(exports, module) {
    init_define_process()
    var baseFindIndex = require_baseFindIndex()
    var baseIsNaN = require_baseIsNaN()
    var strictIndexOf = require_strictIndexOf()
    function baseIndexOf(array, value, fromIndex) {
      return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex)
    }
    module.exports = baseIndexOf
  },
})

// node_modules/lodash/_arrayIncludes.js
var require_arrayIncludes = __commonJS({
  'node_modules/lodash/_arrayIncludes.js'(exports, module) {
    init_define_process()
    var baseIndexOf = require_baseIndexOf()
    function arrayIncludes(array, value) {
      var length = array == null ? 0 : array.length
      return !!length && baseIndexOf(array, value, 0) > -1
    }
    module.exports = arrayIncludes
  },
})

// node_modules/lodash/_arrayIncludesWith.js
var require_arrayIncludesWith = __commonJS({
  'node_modules/lodash/_arrayIncludesWith.js'(exports, module) {
    init_define_process()
    function arrayIncludesWith(array, value, comparator) {
      var index = -1,
        length = array == null ? 0 : array.length
      while (++index < length) {
        if (comparator(value, array[index])) {
          return true
        }
      }
      return false
    }
    module.exports = arrayIncludesWith
  },
})

// node_modules/lodash/_arrayMap.js
var require_arrayMap = __commonJS({
  'node_modules/lodash/_arrayMap.js'(exports, module) {
    init_define_process()
    function arrayMap(array, iteratee) {
      var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length)
      while (++index < length) {
        result[index] = iteratee(array[index], index, array)
      }
      return result
    }
    module.exports = arrayMap
  },
})

// node_modules/lodash/_baseUnary.js
var require_baseUnary = __commonJS({
  'node_modules/lodash/_baseUnary.js'(exports, module) {
    init_define_process()
    function baseUnary(func) {
      return function (value) {
        return func(value)
      }
    }
    module.exports = baseUnary
  },
})

// node_modules/lodash/_cacheHas.js
var require_cacheHas = __commonJS({
  'node_modules/lodash/_cacheHas.js'(exports, module) {
    init_define_process()
    function cacheHas(cache, key) {
      return cache.has(key)
    }
    module.exports = cacheHas
  },
})

// node_modules/lodash/_baseDifference.js
var require_baseDifference = __commonJS({
  'node_modules/lodash/_baseDifference.js'(exports, module) {
    init_define_process()
    var SetCache = require_SetCache()
    var arrayIncludes = require_arrayIncludes()
    var arrayIncludesWith = require_arrayIncludesWith()
    var arrayMap = require_arrayMap()
    var baseUnary = require_baseUnary()
    var cacheHas = require_cacheHas()
    var LARGE_ARRAY_SIZE = 200
    function baseDifference(array, values, iteratee, comparator) {
      var index = -1,
        includes = arrayIncludes,
        isCommon = true,
        length = array.length,
        result = [],
        valuesLength = values.length
      if (!length) {
        return result
      }
      if (iteratee) {
        values = arrayMap(values, baseUnary(iteratee))
      }
      if (comparator) {
        includes = arrayIncludesWith
        isCommon = false
      } else if (values.length >= LARGE_ARRAY_SIZE) {
        includes = cacheHas
        isCommon = false
        values = new SetCache(values)
      }
      outer: while (++index < length) {
        var value = array[index],
          computed = iteratee == null ? value : iteratee(value)
        value = comparator || value !== 0 ? value : 0
        if (isCommon && computed === computed) {
          var valuesIndex = valuesLength
          while (valuesIndex--) {
            if (values[valuesIndex] === computed) {
              continue outer
            }
          }
          result.push(value)
        } else if (!includes(values, computed, comparator)) {
          result.push(value)
        }
      }
      return result
    }
    module.exports = baseDifference
  },
})

// node_modules/lodash/_arrayPush.js
var require_arrayPush = __commonJS({
  'node_modules/lodash/_arrayPush.js'(exports, module) {
    init_define_process()
    function arrayPush(array, values) {
      var index = -1,
        length = values.length,
        offset = array.length
      while (++index < length) {
        array[offset + index] = values[index]
      }
      return array
    }
    module.exports = arrayPush
  },
})

// node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS({
  'node_modules/lodash/isObjectLike.js'(exports, module) {
    init_define_process()
    function isObjectLike(value) {
      return value != null && typeof value == 'object'
    }
    module.exports = isObjectLike
  },
})

// node_modules/lodash/_baseIsArguments.js
var require_baseIsArguments = __commonJS({
  'node_modules/lodash/_baseIsArguments.js'(exports, module) {
    init_define_process()
    var baseGetTag = require_baseGetTag()
    var isObjectLike = require_isObjectLike()
    var argsTag = '[object Arguments]'
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag
    }
    module.exports = baseIsArguments
  },
})

// node_modules/lodash/isArguments.js
var require_isArguments = __commonJS({
  'node_modules/lodash/isArguments.js'(exports, module) {
    init_define_process()
    var baseIsArguments = require_baseIsArguments()
    var isObjectLike = require_isObjectLike()
    var objectProto = Object.prototype
    var hasOwnProperty = objectProto.hasOwnProperty
    var propertyIsEnumerable = objectProto.propertyIsEnumerable
    var isArguments = baseIsArguments(
      (function () {
        return arguments
      })(),
    )
      ? baseIsArguments
      : function (value) {
          return (
            isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee')
          )
        }
    module.exports = isArguments
  },
})

// node_modules/lodash/isArray.js
var require_isArray = __commonJS({
  'node_modules/lodash/isArray.js'(exports, module) {
    init_define_process()
    var isArray = Array.isArray
    module.exports = isArray
  },
})

// node_modules/lodash/_isFlattenable.js
var require_isFlattenable = __commonJS({
  'node_modules/lodash/_isFlattenable.js'(exports, module) {
    init_define_process()
    var Symbol2 = require_Symbol()
    var isArguments = require_isArguments()
    var isArray = require_isArray()
    var spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : void 0
    function isFlattenable(value) {
      return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol])
    }
    module.exports = isFlattenable
  },
})

// node_modules/lodash/_baseFlatten.js
var require_baseFlatten = __commonJS({
  'node_modules/lodash/_baseFlatten.js'(exports, module) {
    init_define_process()
    var arrayPush = require_arrayPush()
    var isFlattenable = require_isFlattenable()
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index = -1,
        length = array.length
      predicate || (predicate = isFlattenable)
      result || (result = [])
      while (++index < length) {
        var value = array[index]
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            baseFlatten(value, depth - 1, predicate, isStrict, result)
          } else {
            arrayPush(result, value)
          }
        } else if (!isStrict) {
          result[result.length] = value
        }
      }
      return result
    }
    module.exports = baseFlatten
  },
})

// node_modules/lodash/identity.js
var require_identity = __commonJS({
  'node_modules/lodash/identity.js'(exports, module) {
    init_define_process()
    function identity(value) {
      return value
    }
    module.exports = identity
  },
})

// node_modules/lodash/_apply.js
var require_apply = __commonJS({
  'node_modules/lodash/_apply.js'(exports, module) {
    init_define_process()
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg)
        case 1:
          return func.call(thisArg, args[0])
        case 2:
          return func.call(thisArg, args[0], args[1])
        case 3:
          return func.call(thisArg, args[0], args[1], args[2])
      }
      return func.apply(thisArg, args)
    }
    module.exports = apply
  },
})

// node_modules/lodash/_overRest.js
var require_overRest = __commonJS({
  'node_modules/lodash/_overRest.js'(exports, module) {
    init_define_process()
    var apply = require_apply()
    var nativeMax = Math.max
    function overRest(func, start, transform) {
      start = nativeMax(start === void 0 ? func.length - 1 : start, 0)
      return function () {
        var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length)
        while (++index < length) {
          array[index] = args[start + index]
        }
        index = -1
        var otherArgs = Array(start + 1)
        while (++index < start) {
          otherArgs[index] = args[index]
        }
        otherArgs[start] = transform(array)
        return apply(func, this, otherArgs)
      }
    }
    module.exports = overRest
  },
})

// node_modules/lodash/constant.js
var require_constant = __commonJS({
  'node_modules/lodash/constant.js'(exports, module) {
    init_define_process()
    function constant(value) {
      return function () {
        return value
      }
    }
    module.exports = constant
  },
})

// node_modules/lodash/_defineProperty.js
var require_defineProperty = __commonJS({
  'node_modules/lodash/_defineProperty.js'(exports, module) {
    init_define_process()
    var getNative = require_getNative()
    var defineProperty = (function () {
      try {
        var func = getNative(Object, 'defineProperty')
        func({}, '', {})
        return func
      } catch (e) {}
    })()
    module.exports = defineProperty
  },
})

// node_modules/lodash/_baseSetToString.js
var require_baseSetToString = __commonJS({
  'node_modules/lodash/_baseSetToString.js'(exports, module) {
    init_define_process()
    var constant = require_constant()
    var defineProperty = require_defineProperty()
    var identity = require_identity()
    var baseSetToString = !defineProperty
      ? identity
      : function (func, string) {
          return defineProperty(func, 'toString', {
            configurable: true,
            enumerable: false,
            value: constant(string),
            writable: true,
          })
        }
    module.exports = baseSetToString
  },
})

// node_modules/lodash/_shortOut.js
var require_shortOut = __commonJS({
  'node_modules/lodash/_shortOut.js'(exports, module) {
    init_define_process()
    var HOT_COUNT = 800
    var HOT_SPAN = 16
    var nativeNow = Date.now
    function shortOut(func) {
      var count = 0,
        lastCalled = 0
      return function () {
        var stamp = nativeNow(),
          remaining = HOT_SPAN - (stamp - lastCalled)
        lastCalled = stamp
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0]
          }
        } else {
          count = 0
        }
        return func.apply(void 0, arguments)
      }
    }
    module.exports = shortOut
  },
})

// node_modules/lodash/_setToString.js
var require_setToString = __commonJS({
  'node_modules/lodash/_setToString.js'(exports, module) {
    init_define_process()
    var baseSetToString = require_baseSetToString()
    var shortOut = require_shortOut()
    var setToString = shortOut(baseSetToString)
    module.exports = setToString
  },
})

// node_modules/lodash/_baseRest.js
var require_baseRest = __commonJS({
  'node_modules/lodash/_baseRest.js'(exports, module) {
    init_define_process()
    var identity = require_identity()
    var overRest = require_overRest()
    var setToString = require_setToString()
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + '')
    }
    module.exports = baseRest
  },
})

// node_modules/lodash/isLength.js
var require_isLength = __commonJS({
  'node_modules/lodash/isLength.js'(exports, module) {
    init_define_process()
    var MAX_SAFE_INTEGER = 9007199254740991
    function isLength(value) {
      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER
    }
    module.exports = isLength
  },
})

// node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS({
  'node_modules/lodash/isArrayLike.js'(exports, module) {
    init_define_process()
    var isFunction = require_isFunction()
    var isLength = require_isLength()
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value)
    }
    module.exports = isArrayLike
  },
})

// node_modules/lodash/isArrayLikeObject.js
var require_isArrayLikeObject = __commonJS({
  'node_modules/lodash/isArrayLikeObject.js'(exports, module) {
    init_define_process()
    var isArrayLike = require_isArrayLike()
    var isObjectLike = require_isObjectLike()
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value)
    }
    module.exports = isArrayLikeObject
  },
})

// node_modules/lodash/last.js
var require_last = __commonJS({
  'node_modules/lodash/last.js'(exports, module) {
    init_define_process()
    function last(array) {
      var length = array == null ? 0 : array.length
      return length ? array[length - 1] : void 0
    }
    module.exports = last
  },
})

// node_modules/lodash/differenceWith.js
var require_differenceWith = __commonJS({
  'node_modules/lodash/differenceWith.js'(exports, module) {
    init_define_process()
    var baseDifference = require_baseDifference()
    var baseFlatten = require_baseFlatten()
    var baseRest = require_baseRest()
    var isArrayLikeObject = require_isArrayLikeObject()
    var last = require_last()
    var differenceWith = baseRest(function (array, values) {
      var comparator = last(values)
      if (isArrayLikeObject(comparator)) {
        comparator = void 0
      }
      return isArrayLikeObject(array)
        ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), void 0, comparator)
        : []
    })
    module.exports = differenceWith
  },
})

// validator/parser/parsedHedGroup.js
var require_parsedHedGroup = __commonJS({
  'validator/parser/parsedHedGroup.js'(exports, module) {
    init_define_process()
    var differenceWith = require_differenceWith()
    var { getParsedParentTags } = require_hedData()
    var { getTagName } = require_hedStrings()
    var ParsedHedSubstring = require_parsedHedSubstring()
    var { ParsedHedTag } = require_parsedHedTag()
    var groupDefinitionTag = function (group, hedSchemas) {
      if (!hedSchemas.isHed3) {
        return ['', null]
      }
      const definitionShortTag = 'Definition'
      const parsedDefinitionTags = getParsedParentTags(hedSchemas, definitionShortTag)
      const definitionTags = group.tags.filter((tag) => {
        if (!(tag instanceof ParsedHedTag)) {
          return false
        }
        const parsedDefinitionTag = parsedDefinitionTags.get(tag.schema)
        return tag.isDescendantOf(parsedDefinitionTag)
      })
      switch (definitionTags.length) {
        case 0:
          return ['', null]
        case 1:
          return [definitionShortTag, definitionTags[0]]
        default:
          return [definitionShortTag, definitionTags]
      }
    }
    var ParsedHedGroup = class extends ParsedHedSubstring {
      constructor(parsedHedTags, hedSchemas, hedString, originalBounds) {
        const originalTag = hedString.substring(...originalBounds)
        super(originalTag, originalBounds)
        this.tags = parsedHedTags
        const [definitionBase, definitionTag] = groupDefinitionTag(this, hedSchemas)
        this.definitionBase = definitionBase
        this.definitionTag = definitionTag
        this.isDefinitionGroup = definitionTag !== null
      }
      get definitionName() {
        return this._memoize('definitionName', () => {
          if (!this.isDefinitionGroup) {
            return null
          }
          return ParsedHedGroup.findDefinitionName(this.definitionTag.canonicalTag, this.definitionBase)
        })
      }
      static findDefinitionName(canonicalTag, definitionBase) {
        const tag = canonicalTag
        let value = getTagName(tag)
        let previousValue
        for (const level of ParsedHedTag.ancestorIterator(tag)) {
          if (value.toLowerCase() === definitionBase.toLowerCase()) {
            return previousValue
          }
          previousValue = value
          value = getTagName(level)
        }
        throw Error(
          `Completed iteration through ${definitionBase.toLowerCase()} tag without finding ${definitionBase} level.`,
        )
      }
      get definitionGroup() {
        return this._memoize('definitionGroup', () => {
          if (!this.isDefinitionGroup) {
            return null
          }
          for (const subgroup of this.tags) {
            if (subgroup instanceof ParsedHedGroup) {
              return subgroup
            }
          }
          throw new Error('Definition group is missing a first-level subgroup.')
        })
      }
      equivalent(other) {
        if (!(other instanceof ParsedHedGroup)) {
          return false
        }
        return (
          differenceWith(this.tags, other.tags, (ours, theirs) => {
            return ours.equivalent(theirs)
          }).length === 0
        )
      }
      nestedGroups() {
        const currentGroup = []
        for (const innerTag of this.tags) {
          if (innerTag instanceof ParsedHedTag) {
            currentGroup.push(innerTag)
          } else if (innerTag instanceof ParsedHedGroup) {
            currentGroup.push(innerTag.nestedGroups())
          }
        }
        return currentGroup
      }
      *subGroupArrayIterator() {
        const currentGroup = []
        for (const innerTag of this.tags) {
          if (innerTag instanceof ParsedHedTag) {
            currentGroup.push(innerTag)
          } else if (innerTag instanceof ParsedHedGroup) {
            yield* innerTag.subGroupArrayIterator()
          }
        }
        yield currentGroup
      }
      *subParsedGroupIterator() {
        yield this
        for (const innerTag of this.tags) {
          if (innerTag instanceof ParsedHedGroup) {
            yield* innerTag.subParsedGroupIterator()
          }
        }
      }
      *tagIterator() {
        for (const innerTag of this.tags) {
          if (innerTag instanceof ParsedHedTag) {
            yield innerTag
          } else if (innerTag instanceof ParsedHedGroup) {
            yield* innerTag.tagIterator()
          }
        }
      }
    }
    module.exports = ParsedHedGroup
  },
})

// validator/parser/parsedHedString.js
var require_parsedHedString = __commonJS({
  'validator/parser/parsedHedString.js'(exports, module) {
    init_define_process()
    var { ParsedHedTag } = require_parsedHedTag()
    var ParsedHedGroup = require_parsedHedGroup()
    var ParsedHedString = class {
      constructor(hedString, parsedTags) {
        this.hedString = hedString
        this.tagGroups = parsedTags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedGroup)
        this.topLevelTags = parsedTags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedTag)
        const subgroupTags = this.tagGroups.flatMap((tagGroup) => Array.from(tagGroup.tagIterator()))
        this.tags = this.topLevelTags.concat(subgroupTags)
        this.topLevelTagGroups = this.tagGroups.map((tagGroup) =>
          tagGroup.tags.filter((tagOrGroup) => tagOrGroup instanceof ParsedHedTag),
        )
        this.definitionGroups = this.tagGroups.filter((group) => {
          return group.isDefinitionGroup
        })
      }
      get definitions() {
        return this.definitionGroups.map((group) => {
          return [group.definitionName, group]
        })
      }
    }
    module.exports = ParsedHedString
  },
})

// node_modules/lodash/flattenDeep.js
var require_flattenDeep = __commonJS({
  'node_modules/lodash/flattenDeep.js'(exports, module) {
    init_define_process()
    var baseFlatten = require_baseFlatten()
    var INFINITY = 1 / 0
    function flattenDeep(array) {
      var length = array == null ? 0 : array.length
      return length ? baseFlatten(array, INFINITY) : []
    }
    module.exports = flattenDeep
  },
})

// validator/parser/splitHedString.js
var require_splitHedString2 = __commonJS({
  'validator/parser/splitHedString.js'(exports, module) {
    init_define_process()
    var flattenDeep = require_flattenDeep()
    var { ParsedHedTag, ParsedHed2Tag, ParsedHed3Tag } = require_parsedHedTag()
    var ParsedHedGroup = require_parsedHedGroup()
    var { Schema, Schemas } = require_types3()
    var { generateIssue } = require_issues()
    var { recursiveMap } = require_array()
    var { replaceTagNameWithPound } = require_hedStrings()
    var { mergeParsingIssues } = require_hedData()
    var { stringIsEmpty } = require_string()
    var openingGroupCharacter = '('
    var closingGroupCharacter = ')'
    var commaCharacter = ','
    var colonCharacter = ':'
    var slashCharacter = '/'
    var invalidCharacters = /* @__PURE__ */ new Set(['{', '}', '[', ']', '~', '"'])
    var invalidCharactersOutsideOfValues = /* @__PURE__ */ new Set([':'])
    var generationToClass = [ParsedHedTag, ParsedHedTag, ParsedHed2Tag, ParsedHed3Tag]
    var TagSpec = class {
      constructor(tag, start, end, librarySchema) {
        this.tag = tag.trim()
        this.bounds = [start, end]
        this.library = librarySchema
      }
    }
    var GroupSpec = class {
      constructor(start, finish) {
        this.start = start
        this.finish = finish
        this.children = []
      }
      get bounds() {
        return [this.start, this.finish]
      }
    }
    var tokenizeHedString = function (hedString) {
      const syntaxIssues = []
      let currentTag = ''
      let groupDepth = 0
      let startingIndex = 0
      let resetStartingIndex = false
      let slashFound = false
      let librarySchema = ''
      const currentGroupStack = [[]]
      const parenthesesStack = [new GroupSpec(0, hedString.length)]
      const pushTag = (i) => {
        if (!stringIsEmpty(currentTag)) {
          currentGroupStack[groupDepth].push(new TagSpec(currentTag, startingIndex, i, librarySchema))
        }
        resetStartingIndex = true
        slashFound = false
        librarySchema = ''
      }
      const closeGroup = (i) => {
        const bounds = parenthesesStack.pop()
        bounds.finish = i + 1
        parenthesesStack[groupDepth - 1].children.push(bounds)
        currentGroupStack[groupDepth - 1].push(currentGroupStack.pop())
        groupDepth--
      }
      for (let i = 0; i < hedString.length; i++) {
        const character = hedString.charAt(i)
        switch (character) {
          case openingGroupCharacter:
            currentGroupStack.push([])
            parenthesesStack.push(new GroupSpec(i))
            resetStartingIndex = true
            groupDepth++
            break
          case closingGroupCharacter: {
            pushTag(i)
            if (groupDepth <= 0) {
              syntaxIssues.push(
                generateIssue('unopenedParenthesis', {
                  index: i,
                  string: hedString,
                }),
              )
              break
            }
            closeGroup(i)
            break
          }
          case commaCharacter:
            pushTag(i)
            break
          case colonCharacter:
            if (!slashFound && !librarySchema) {
              librarySchema = currentTag
              resetStartingIndex = true
            } else {
              currentTag += character
            }
            break
          case slashCharacter:
            slashFound = true
            currentTag += character
            break
          default:
            currentTag += character
            resetStartingIndex = stringIsEmpty(currentTag)
        }
        if (resetStartingIndex) {
          resetStartingIndex = false
          startingIndex = i + 1
          currentTag = ''
        }
      }
      pushTag(hedString.length)
      while (groupDepth > 0) {
        syntaxIssues.push(
          generateIssue('unclosedParenthesis', {
            index: parenthesesStack[parenthesesStack.length - 1].start,
            string: hedString,
          }),
        )
        closeGroup(hedString.length)
      }
      const tagSpecs = currentGroupStack.pop()
      const groupSpecs = parenthesesStack.pop()
      const issues = {
        syntax: syntaxIssues,
        conversion: [],
      }
      return [tagSpecs, groupSpecs, issues]
    }
    var checkForInvalidCharacters = function (hedString, tagSpecs) {
      const syntaxIssues = []
      const flatTagSpecs = flattenDeep(tagSpecs)
      for (const tagSpec of flatTagSpecs) {
        const alwaysInvalidIssues = checkTagForInvalidCharacters(hedString, tagSpec, tagSpec.tag, invalidCharacters)
        const valueTag = replaceTagNameWithPound(tagSpec.tag)
        const outsideValueIssues = checkTagForInvalidCharacters(
          hedString,
          tagSpec,
          valueTag,
          invalidCharactersOutsideOfValues,
        )
        syntaxIssues.push(...alwaysInvalidIssues, ...outsideValueIssues)
      }
      return { syntax: syntaxIssues, conversion: [] }
    }
    var checkTagForInvalidCharacters = function (hedString, tagSpec, tag, invalidSet) {
      const issues = []
      for (let i = 0; i < tag.length; i++) {
        const character = tag.charAt(i)
        if (invalidSet.has(character)) {
          tagSpec.invalidCharacter = true
          issues.push(
            generateIssue('invalidCharacter', {
              character,
              index: tagSpec.bounds[0] + i,
              string: hedString,
            }),
          )
        }
      }
      return issues
    }
    var createParsedTags = function (hedString, hedSchemas, tagSpecs, groupSpecs) {
      const conversionIssues = []
      const syntaxIssues = []
      const ParsedHedTagClass = generationToClass[hedSchemas.generation]
      const createParsedTag = ({ library: librarySchema, tag: originalTag, bounds: originalBounds }) => {
        const parsedTag = new ParsedHedTagClass(originalTag, hedString, originalBounds, hedSchemas, librarySchema)
        conversionIssues.push(...parsedTag.conversionIssues)
        return parsedTag
      }
      const createParsedGroups = (tags, groupSpecs2) => {
        const tagGroups = []
        let index = 0
        for (const tag of tags) {
          if (Array.isArray(tag)) {
            const groupSpec = groupSpecs2[index]
            tagGroups.push(
              new ParsedHedGroup(createParsedGroups(tag, groupSpec.children), hedSchemas, hedString, groupSpec.bounds),
            )
            index++
          } else {
            tagGroups.push(tag)
          }
        }
        return tagGroups
      }
      const parsedTags = recursiveMap(createParsedTag, tagSpecs)
      const parsedTagsWithGroups = createParsedGroups(parsedTags, groupSpecs.children)
      const issues = {
        syntax: syntaxIssues,
        conversion: conversionIssues,
      }
      return [parsedTagsWithGroups, issues]
    }
    var splitHedString = function (hedString, hedSchemas) {
      const [tagSpecs, groupBounds, splitIssues] = tokenizeHedString(hedString)
      const characterIssues = checkForInvalidCharacters(hedString, tagSpecs)
      mergeParsingIssues(splitIssues, characterIssues)
      if (splitIssues.syntax.length > 0) {
        return [null, splitIssues]
      }
      const [parsedTags, parsingIssues] = createParsedTags(hedString, hedSchemas, tagSpecs, groupBounds)
      mergeParsingIssues(splitIssues, parsingIssues)
      return [parsedTags, splitIssues]
    }
    module.exports = splitHedString
  },
})

// validator/parser/main.js
var require_main = __commonJS({
  'validator/parser/main.js'(exports, module) {
    init_define_process()
    var utils = require_utils2()
    var { mergeParsingIssues } = require_hedData()
    var { generateIssue } = require_issues()
    var ParsedHedString = require_parsedHedString()
    var splitHedString = require_splitHedString2()
    var openingGroupCharacter = '('
    var closingGroupCharacter = ')'
    var delimiters = /* @__PURE__ */ new Set([','])
    var substituteCharacters = function (hedString) {
      const issues = []
      const illegalCharacterMap = { '\0': ['ASCII NUL', ' '] }
      const flaggedCharacters = /[^\w\d./$ :-]/g
      const replaceFunction = function (match, offset) {
        if (match in illegalCharacterMap) {
          const [name, replacement] = illegalCharacterMap[match]
          issues.push(
            generateIssue('invalidCharacter', {
              character: name,
              index: offset,
              string: hedString,
            }),
          )
          return replacement
        } else {
          return match
        }
      }
      const fixedString = hedString.replace(flaggedCharacters, replaceFunction)
      return [fixedString, issues]
    }
    var countTagGroupParentheses = function (hedString) {
      const issues = []
      const numberOfOpeningParentheses = utils.string.getCharacterCount(hedString, openingGroupCharacter)
      const numberOfClosingParentheses = utils.string.getCharacterCount(hedString, closingGroupCharacter)
      if (numberOfOpeningParentheses !== numberOfClosingParentheses) {
        issues.push(
          generateIssue('parentheses', {
            opening: numberOfOpeningParentheses,
            closing: numberOfClosingParentheses,
          }),
        )
      }
      return issues
    }
    var isCommaMissingAfterClosingParenthesis = function (lastNonEmptyCharacter, currentCharacter) {
      return (
        lastNonEmptyCharacter === closingGroupCharacter &&
        !(delimiters.has(currentCharacter) || currentCharacter === closingGroupCharacter)
      )
    }
    var findDelimiterIssuesInHedString = function (hedString) {
      const issues = []
      let lastNonEmptyValidCharacter = ''
      let lastNonEmptyValidIndex = 0
      let currentTag = ''
      for (let i = 0; i < hedString.length; i++) {
        const currentCharacter = hedString.charAt(i)
        currentTag += currentCharacter
        if (utils.string.stringIsEmpty(currentCharacter)) {
          continue
        }
        if (delimiters.has(currentCharacter)) {
          if (currentTag.trim() === currentCharacter) {
            issues.push(
              generateIssue('extraDelimiter', {
                character: currentCharacter,
                index: i,
                string: hedString,
              }),
            )
            currentTag = ''
            continue
          }
          currentTag = ''
        } else if (currentCharacter === openingGroupCharacter) {
          if (currentTag.trim() === openingGroupCharacter) {
            currentTag = ''
          } else {
            issues.push(generateIssue('invalidTag', { tag: currentTag }))
          }
        } else if (isCommaMissingAfterClosingParenthesis(lastNonEmptyValidCharacter, currentCharacter)) {
          issues.push(
            generateIssue('commaMissing', {
              tag: currentTag.slice(0, -1),
            }),
          )
          break
        }
        lastNonEmptyValidCharacter = currentCharacter
        lastNonEmptyValidIndex = i
      }
      if (delimiters.has(lastNonEmptyValidCharacter)) {
        issues.push(
          generateIssue('extraDelimiter', {
            character: lastNonEmptyValidCharacter,
            index: lastNonEmptyValidIndex,
            string: hedString,
          }),
        )
      }
      return issues
    }
    var validateFullUnparsedHedString = function (hedString) {
      const [fixedHedString, substitutionIssues] = substituteCharacters(hedString)
      const delimiterIssues = [].concat(
        countTagGroupParentheses(fixedHedString),
        findDelimiterIssuesInHedString(fixedHedString),
      )
      return {
        substitution: substitutionIssues,
        delimiter: delimiterIssues,
      }
    }
    var parseHedString = function (hedString, hedSchemas) {
      const fullStringIssues = validateFullUnparsedHedString(hedString)
      if (fullStringIssues.delimiter.length > 0) {
        fullStringIssues.syntax = []
        return [null, fullStringIssues]
      }
      const [parsedTags, splitIssues] = splitHedString(hedString, hedSchemas)
      const parsingIssues = Object.assign(fullStringIssues, splitIssues)
      if (parsedTags === null) {
        return [null, parsingIssues]
      }
      const parsedString = new ParsedHedString(hedString, parsedTags)
      return [parsedString, parsingIssues]
    }
    var parseHedStrings = function (hedStrings, hedSchemas) {
      return hedStrings
        .map((hedString) => {
          return parseHedString(hedString, hedSchemas)
        })
        .reduce(
          ([previousStrings, previousIssues], [currentString, currentIssues]) => {
            previousStrings.push(currentString)
            mergeParsingIssues(previousIssues, currentIssues)
            return [previousStrings, previousIssues]
          },
          [[], {}],
        )
    }
    module.exports = {
      splitHedString,
      parseHedString,
      parseHedStrings,
    }
  },
})

// utils/bids.js
var require_bids = __commonJS({
  'utils/bids.js'(exports, module) {
    init_define_process()
    var sidecarValueHasHed = function (sidecarValue) {
      return sidecarValue !== null && typeof sidecarValue === 'object' && sidecarValue.HED !== void 0
    }
    module.exports = {
      sidecarValueHasHed,
    }
  },
})

// validator/bids/types.js
var require_types4 = __commonJS({
  'validator/bids/types.js'(exports, module) {
    init_define_process()
    var { ParsedHedString, ParsedHedGroup } = require_main()
    var { sidecarValueHasHed } = require_bids()
    var { Issue } = require_issues()
    var BidsData = class {
      constructor() {
        this.parsedStringMapping = /* @__PURE__ */ new Map()
        this.definitions = /* @__PURE__ */ new Map()
        this.hedIssues = []
      }
    }
    var BidsFile = class extends BidsData {
      constructor(name, file) {
        super()
        this.file = file
      }
    }
    var BidsJsonFile = class extends BidsFile {
      constructor(name, jsonData, file) {
        super(name, file)
        this.jsonData = jsonData
      }
    }
    var BidsTsvFile = class extends BidsFile {
      constructor(name, parsedTsv, file) {
        super(name, file)
        this.parsedTsv = parsedTsv
        this.parseHedColumn()
      }
      parseHedColumn() {
        const hedColumnIndex = this.parsedTsv.headers.indexOf('HED')
        if (hedColumnIndex === -1) {
          this.hedColumnHedStrings = []
        } else {
          this.hedColumnHedStrings = this.parsedTsv.rows
            .slice(1)
            .map((rowCells) => rowCells[hedColumnIndex])
            .map((hedCell) => (hedCell && hedCell !== 'n/a' ? hedCell : ''))
        }
      }
    }
    var BidsEventFile = class extends BidsTsvFile {
      constructor(name, potentialSidecars, mergedDictionary, parsedTsv, file) {
        super(name, parsedTsv, file)
        this.potentialSidecars = potentialSidecars
        this.mergedSidecar = new BidsSidecar(name, mergedDictionary, null)
        this.sidecarHedData = this.mergedSidecar.hedData
      }
    }
    var BidsSidecar = class extends BidsJsonFile {
      constructor(name, sidecarData = {}, file) {
        super(name, sidecarData, file)
        this.filterHedStrings()
        this.categorizeHedStrings()
      }
      filterHedStrings() {
        const sidecarHedTags = Object.entries(this.jsonData)
          .map(([sidecarKey, sidecarValue]) => {
            if (sidecarValueHasHed(sidecarValue)) {
              return [sidecarKey, sidecarValue.HED]
            } else {
              return []
            }
          })
          .filter((x) => x.length > 0)
        this.hedData = new Map(sidecarHedTags)
      }
      categorizeHedStrings() {
        this.hedValueStrings = []
        this.hedCategoricalStrings = []
        for (const sidecarValue of this.hedData.values()) {
          if (typeof sidecarValue === 'string') {
            this.hedValueStrings.push(sidecarValue)
          } else {
            this.hedCategoricalStrings.push(...Object.values(sidecarValue))
          }
        }
      }
      get hedStrings() {
        return this.hedValueStrings.concat(this.hedCategoricalStrings)
      }
      get sidecarData() {
        return this.jsonData
      }
    }
    var fallbackDatasetDescription = new BidsJsonFile('./dataset_description.json', null)
    var BidsDataset = class extends BidsData {
      constructor(
        eventData,
        sidecarData,
        datasetDescription = fallbackDatasetDescription,
        datasetRootDirectory = null,
      ) {
        super()
        this.eventData = eventData
        this.sidecarData = sidecarData
        this.datasetDescription = datasetDescription
        this.datasetRootDirectory = datasetRootDirectory
      }
    }
    var bidsHedErrorCodes = /* @__PURE__ */ new Set([104, 106, 107])
    var BidsIssue = class {
      constructor(issueCode, file, evidence) {
        this.code = issueCode
        this.file = file
        this.evidence = evidence
      }
      isError() {
        return bidsHedErrorCodes.has(this.code)
      }
      static generateInternalErrorPromise(error) {
        return Promise.resolve([new BidsIssue(107, null, error.message)])
      }
    }
    var BidsHedIssue = class extends BidsIssue {
      constructor(hedIssue, file) {
        super(hedIssue.level === 'warning' ? 105 : 104, file, hedIssue.message)
        this.hedIssue = hedIssue
      }
    }
    module.exports = {
      BidsDataset,
      BidsEventFile,
      BidsHedIssue,
      BidsIssue,
      BidsJsonFile,
      BidsSidecar,
    }
  },
})

// validator/event/validator.js
var require_validator = __commonJS({
  'validator/event/validator.js'(exports, module) {
    init_define_process()
    var utils = require_utils2()
    var { ParsedHedTag } = require_parsedHedTag()
    var ParsedHedString = require_parsedHedString()
    var { generateIssue } = require_issues()
    var { Schemas } = require_schema()
    var uniqueType = 'unique'
    var requiredType = 'required'
    var requireChildType = 'requireChild'
    var clockTimeUnitClass = 'clockTime'
    var dateTimeUnitClass = 'dateTime'
    var timeUnitClass = 'time'
    var HedValidator = class {
      constructor(parsedString, hedSchemas, options) {
        this.parsedString = parsedString
        this.hedSchemas = hedSchemas
        this.options = options
        this.issues = []
      }
      validateStringLevel() {
        this.options.isEventLevel = false
        this.validateFullParsedHedString()
        this.validateIndividualHedTags()
        this.validateHedTagGroups()
      }
      validateEventLevel() {
        this.options.isEventLevel = true
        this.validateTopLevelTags()
        this.validateIndividualHedTags()
        this.validateHedTagLevels()
        this.validateHedTagGroups()
      }
      validateFullParsedHedString() {
        this.checkPlaceholderStringSyntax()
      }
      validateIndividualHedTags() {
        let previousTag = null
        for (const tag of this.parsedString.tags) {
          this.validateIndividualHedTag(tag, previousTag)
          previousTag = tag
        }
      }
      validateIndividualHedTag(tag, previousTag) {
        if (this.hedSchemas.generation > 0) {
          this.checkIfTagIsValid(tag, previousTag)
          this.checkIfTagUnitClassUnitsAreValid(tag)
          this.checkIfTagRequiresChild(tag)
          if (!this.options.isEventLevel) {
            this.checkValueTagSyntax(tag)
          }
        }
        if (this.options.expectValuePlaceholderString) {
          this.checkPlaceholderTagSyntax(tag)
        }
      }
      validateHedTagLevels() {
        for (const tagGroup of this.parsedString.tagGroups) {
          for (const subGroup of tagGroup.subGroupArrayIterator()) {
            this.validateHedTagLevel(subGroup)
          }
        }
        this.validateHedTagLevel(this.parsedString.topLevelTags)
      }
      validateHedTagLevel(tagList) {
        if (this.hedSchemas.generation > 0) {
          this.checkForMultipleUniqueTags(tagList)
        }
        this.checkForDuplicateTags(tagList)
      }
      validateHedTagGroups() {
        for (const tagGroup of this.parsedString.tagGroups) {
          for (const subGroup of tagGroup.subParsedGroupIterator()) {
            this.validateHedTagGroup(subGroup)
          }
        }
      }
      validateHedTagGroup(parsedTagGroup) {}
      validateTopLevelTags() {
        if (this.hedSchemas.generation > 0 && this.options.checkForWarnings) {
          this.checkForRequiredTags()
        }
      }
      checkForDuplicateTags(tagList) {
        const duplicateTags = /* @__PURE__ */ new Set()
        const addIssue = (tag) => {
          if (duplicateTags.has(tag)) {
            return
          }
          this.pushIssue('duplicateTag', {
            tag: tag.originalTag,
            bounds: tag.originalBounds,
          })
          duplicateTags.add(tag)
        }
        for (const firstTag of tagList) {
          for (const secondTag of tagList) {
            if (firstTag !== secondTag && firstTag.equivalent(secondTag)) {
              addIssue(firstTag)
              addIssue(secondTag)
            }
          }
        }
      }
      checkForMultipleUniqueTags(tagList) {
        this._checkForTagAttribute(uniqueType, (uniqueTagPrefix) => {
          if (tagList.filter((tag) => tag.formattedTag.startsWith(uniqueTagPrefix)).length > 1) {
            this.pushIssue('multipleUniqueTags', {
              tag: uniqueTagPrefix,
            })
          }
        })
      }
      checkForRequiredTags() {
        this._checkForTagAttribute(requiredType, (requiredTagPrefix) => {
          if (!this.parsedString.topLevelTags.some((tag) => tag.formattedTag.startsWith(requiredTagPrefix))) {
            this.pushIssue('requiredPrefixMissing', {
              tagPrefix: requiredTagPrefix,
            })
          }
        })
      }
      _checkForTagAttribute(attribute, fn) {}
      checkIfTagRequiresChild(tag) {
        const invalid = tag.hasAttribute(requireChildType)
        if (invalid) {
          this.pushIssue('childRequired', { tag: tag.originalTag })
        }
      }
      checkIfTagUnitClassUnitsAreValid(tag) {}
      checkValueTagSyntax(tag) {}
      checkIfTagIsValid(tag, previousTag) {
        if (tag.existsInSchema || tag.takesValue) {
          return
        }
        const isExtensionAllowedTag = tag.allowsExtensions
        if (this.options.expectValuePlaceholderString && tag.formattedTag.split('#').length === 2) {
          const valueTag = utils.HED.replaceTagNameWithPound(tag.formattedTag)
          if (valueTag.split('#').length !== 2) {
          } else {
            this.pushIssue('invalidPlaceholder', {
              tag: tag.originalTag,
            })
          }
        } else if (!isExtensionAllowedTag && previousTag && previousTag.takesValue) {
          this.pushIssue('extraCommaOrInvalid', {
            tag: tag.originalTag,
            previousTag: previousTag.originalTag,
          })
        } else if (!isExtensionAllowedTag) {
          this.pushIssue('invalidTag', { tag: tag.originalTag })
        } else if (!this.options.isEventLevel && this.options.checkForWarnings) {
          this.pushIssue('extension', { tag: tag.originalTag })
        }
      }
      checkPlaceholderTagSyntax(tag) {
        const placeholderCount = utils.string.getCharacterCount(tag.formattedTag, '#')
        if (placeholderCount === 1) {
          const valueTag = utils.HED.replaceTagNameWithPound(tag.formattedTag)
          if (utils.string.getCharacterCount(valueTag, '#') !== 1) {
            this.pushIssue('invalidPlaceholder', {
              tag: tag.originalTag,
            })
          }
        } else if (placeholderCount > 1) {
          this.pushIssue('invalidPlaceholder', {
            tag: tag.originalTag,
          })
        }
      }
      checkPlaceholderStringSyntax() {
        let standalonePlaceholders = 0
        let definitionPlaceholders
        let standaloneIssueGenerated = false
        let firstStandaloneTag = ''
        for (const tag of this.parsedString.topLevelTags) {
          const tagString = tag.formattedTag
          const tagPlaceholders = utils.string.getCharacterCount(tagString, '#')
          standalonePlaceholders += tagPlaceholders
          if (!firstStandaloneTag && standalonePlaceholders >= 1) {
            firstStandaloneTag = tag.originalTag
          }
          if (
            tagPlaceholders &&
            ((!this.options.expectValuePlaceholderString && standalonePlaceholders) || standalonePlaceholders > 1)
          ) {
            if (this.options.expectValuePlaceholderString && !standaloneIssueGenerated) {
              this.pushIssue('invalidPlaceholder', {
                tag: firstStandaloneTag,
              })
            }
            this.pushIssue('invalidPlaceholder', {
              tag: tag.originalTag,
            })
            standaloneIssueGenerated = true
          }
        }
        for (const tagGroup of this.parsedString.tagGroups) {
          if (tagGroup.isDefinitionGroup) {
            definitionPlaceholders = 0
            const isDefinitionPlaceholder = tagGroup.definitionTag.formattedTagName === '#'
            const definitionName = tagGroup.definitionName
            for (const tag of tagGroup.tagIterator()) {
              if (isDefinitionPlaceholder && tag === tagGroup.definitionTag) {
                continue
              }
              const tagString = tag.formattedTag
              definitionPlaceholders += utils.string.getCharacterCount(tagString, '#')
            }
            if (
              !(
                (!isDefinitionPlaceholder && definitionPlaceholders === 0) ||
                (isDefinitionPlaceholder && definitionPlaceholders === 1)
              )
            ) {
              this.pushIssue('invalidPlaceholderInDefinition', {
                definition: definitionName,
              })
            }
          } else if (!standaloneIssueGenerated) {
            for (const tag of tagGroup.tagIterator()) {
              const tagString = tag.formattedTag
              const tagPlaceholders = utils.string.getCharacterCount(tagString, '#')
              standalonePlaceholders += tagPlaceholders
              if (!firstStandaloneTag && standalonePlaceholders >= 1) {
                firstStandaloneTag = tag.originalTag
              }
              if (
                tagPlaceholders &&
                ((!this.options.expectValuePlaceholderString && standalonePlaceholders) || standalonePlaceholders > 1)
              ) {
                if (this.options.expectValuePlaceholderString && !standaloneIssueGenerated) {
                  this.pushIssue('invalidPlaceholder', {
                    tag: firstStandaloneTag,
                  })
                }
                this.pushIssue('invalidPlaceholder', {
                  tag: tag.originalTag,
                })
                standaloneIssueGenerated = true
              }
            }
          }
        }
        if (this.options.expectValuePlaceholderString && standalonePlaceholders === 0) {
          this.pushIssue('missingPlaceholder', {
            string: this.parsedString.hedString,
          })
        }
      }
      pushIssue(internalCode, parameters) {
        this.issues.push(generateIssue(internalCode, parameters))
      }
    }
    var Hed2Validator = class extends HedValidator {
      constructor(parsedString, hedSchemas, options) {
        super(parsedString, hedSchemas, options)
      }
      _checkForTagAttribute(attribute, fn) {
        const tags = this.hedSchemas.baseSchema.attributes.tagAttributes[attribute]
        for (const tag of Object.keys(tags)) {
          fn(tag)
        }
      }
      checkIfTagUnitClassUnitsAreValid(tag) {
        if (tag.existsInSchema || !tag.hasUnitClass) {
          return
        }
        const tagUnitClasses = tag.unitClasses
        const originalTagUnitValue = tag.originalTagName
        const formattedTagUnitValue = tag.formattedTagName
        const tagUnitClassUnits = tag.validUnits
        if (
          dateTimeUnitClass in this.hedSchemas.baseSchema.attributes.unitClasses &&
          tagUnitClasses.includes(dateTimeUnitClass)
        ) {
          if (!utils.string.isDateTime(formattedTagUnitValue)) {
            this.pushIssue('invalidValue', { tag: tag.originalTag })
          }
          return
        } else if (
          clockTimeUnitClass in this.hedSchemas.baseSchema.attributes.unitClasses &&
          tagUnitClasses.includes(clockTimeUnitClass)
        ) {
          if (!utils.string.isClockFaceTime(formattedTagUnitValue)) {
            this.pushIssue('invalidValue', { tag: tag.originalTag })
          }
          return
        } else if (
          timeUnitClass in this.hedSchemas.baseSchema.attributes.unitClasses &&
          tagUnitClasses.includes(timeUnitClass) &&
          tag.originalTag.includes(':')
        ) {
          if (!utils.string.isClockFaceTime(formattedTagUnitValue)) {
            this.pushIssue('invalidValue', { tag: tag.originalTag })
          }
          return
        }
        const [foundUnit, validUnit, value] = utils.HED.validateUnits(
          originalTagUnitValue,
          tagUnitClassUnits,
          this.hedSchemas.baseSchema.attributes,
        )
        const validValue = this.validateValue(
          value,
          this.hedSchemas.baseSchema.tagHasAttribute(tag.takesValueFormattedTag, 'isNumeric'),
        )
        if (!foundUnit && this.options.checkForWarnings) {
          const defaultUnit = tag.defaultUnit
          this.pushIssue('unitClassDefaultUsed', {
            tag: tag.originalTag,
            defaultUnit,
          })
        } else if (!validUnit) {
          this.pushIssue('unitClassInvalidUnit', {
            tag: tag.originalTag,
            unitClassUnits: tagUnitClassUnits.sort().join(','),
          })
        } else if (!validValue) {
          this.pushIssue('invalidValue', { tag: tag.originalTag })
        }
      }
      checkValueTagSyntax(tag) {
        if (tag.takesValue && !tag.hasUnitClass) {
          const isValidValue = this.validateValue(
            tag.formattedTagName,
            this.hedSchemas.baseSchema.tagHasAttribute(tag.takesValueFormattedTag, 'isNumeric'),
          )
          if (!isValidValue) {
            this.pushIssue('invalidValue', { tag: tag.originalTag })
          }
        }
      }
      validateValue(value, isNumeric) {
        if (value === '#') {
          return true
        }
        if (isNumeric) {
          return utils.string.isNumber(value)
        }
        const hed2ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_; :]+$/
        return hed2ValidValueCharacters.test(value)
      }
    }
    module.exports = {
      HedValidator,
      Hed2Validator,
    }
  },
})

// validator/event/hed3.js
var require_hed3 = __commonJS({
  'validator/event/hed3.js'(exports, module) {
    init_define_process()
    var utils = require_utils2()
    var { getParsedParentTags } = require_hedData()
    var ParsedHedGroup = require_parsedHedGroup()
    var { ParsedHedTag } = require_parsedHedTag()
    var { HedValidator } = require_validator()
    var tagGroupType = 'tagGroup'
    var topLevelTagGroupType = 'topLevelTagGroup'
    var Hed3Validator = class extends HedValidator {
      constructor(parsedString, hedSchemas, definitions, options) {
        super(parsedString, hedSchemas, options)
        this.definitions = definitions
      }
      validateEventLevel() {
        super.validateEventLevel()
        this.validateTopLevelTagGroups()
      }
      validateIndividualHedTag(tag, previousTag) {
        super.validateIndividualHedTag(tag, previousTag)
        if (this.definitions !== null) {
          this.checkForMissingDefinitions(tag, 'Def')
          this.checkForMissingDefinitions(tag, 'Def-expand')
        }
      }
      validateHedTagGroup(parsedTagGroup) {
        super.validateHedTagGroup(parsedTagGroup)
        this.checkDefinitionSyntax(parsedTagGroup)
      }
      validateTopLevelTags() {
        super.validateTopLevelTags()
        this.checkForInvalidTopLevelTags()
      }
      validateTopLevelTagGroups() {
        this.checkForInvalidTopLevelTagGroupTags()
      }
      _checkForTagAttribute(attribute, fn) {
        const schemas = this.hedSchemas.schemas.values()
        for (const schema of schemas) {
          const tags = schema.entries.definitions.get('tags').getEntriesWithBooleanAttribute(attribute)
          for (const tag of tags) {
            fn(tag.name)
          }
        }
      }
      checkIfTagUnitClassUnitsAreValid(tag) {
        if (tag.existsInSchema || !tag.hasUnitClass) {
          return
        }
        const [foundUnit, validUnit, value] = this.validateUnits(tag)
        if (!foundUnit && this.options.checkForWarnings) {
          const defaultUnit = tag.defaultUnit
          this.pushIssue('unitClassDefaultUsed', {
            tag: tag.originalTag,
            defaultUnit,
          })
        } else if (!validUnit) {
          const tagUnitClassUnits = Array.from(tag.validUnits).map((unit) => unit.name)
          this.pushIssue('unitClassInvalidUnit', {
            tag: tag.originalTag,
            unitClassUnits: tagUnitClassUnits.sort().join(','),
          })
        } else {
          const validValue = this.validateValue(value, true)
          if (!validValue) {
            this.pushIssue('invalidValue', { tag: tag.originalTag })
          }
        }
      }
      checkValueTagSyntax(tag) {
        if (tag.takesValue && !tag.hasUnitClass) {
          const isValidValue = this.validateValue(tag.formattedTagName, tag.takesValueTag.hasAttributeName('isNumeric'))
          if (!isValidValue) {
            this.pushIssue('invalidValue', { tag: tag.originalTag })
          }
        }
      }
      validateUnits(tag) {
        const originalTagUnitValue = tag.originalTagName
        const tagUnitClassUnits = tag.validUnits
        const validUnits = tag.schema.entries.allUnits
        const unitStrings = Array.from(validUnits.keys())
        unitStrings.sort((first, second) => {
          return second.length - first.length
        })
        let actualUnit = utils.HED.getTagName(originalTagUnitValue, ' ')
        let noUnitFound = false
        if (actualUnit === originalTagUnitValue) {
          actualUnit = ''
          noUnitFound = true
        }
        let foundUnit, foundWrongCaseUnit, strippedValue
        for (const unitName of unitStrings) {
          const unit = validUnits.get(unitName)
          const isPrefixUnit = unit.isPrefixUnit
          const isUnitSymbol = unit.isUnitSymbol
          for (const derivativeUnit of unit.derivativeUnits()) {
            if (isPrefixUnit && originalTagUnitValue.startsWith(derivativeUnit)) {
              foundUnit = true
              noUnitFound = false
              strippedValue = originalTagUnitValue.substring(derivativeUnit.length).trim()
            }
            if (actualUnit === derivativeUnit) {
              foundUnit = true
              strippedValue = utils.HED.getParentTag(originalTagUnitValue, ' ')
            } else if (actualUnit.toLowerCase() === derivativeUnit.toLowerCase()) {
              if (isUnitSymbol) {
                foundWrongCaseUnit = true
              } else {
                foundUnit = true
              }
              strippedValue = utils.HED.getParentTag(originalTagUnitValue, ' ')
            }
            if (foundUnit) {
              const unitIsValid = tagUnitClassUnits.has(unit)
              return [true, unitIsValid, strippedValue]
            }
          }
          if (foundWrongCaseUnit) {
            return [true, false, strippedValue]
          }
        }
        return [!noUnitFound, false, originalTagUnitValue]
      }
      validateValue(value, isNumeric) {
        if (value === '#') {
          return true
        }
        if (isNumeric) {
          return utils.string.isNumber(value)
        }
        const hed3ValidValueCharacters = /^[-a-zA-Z0-9.$%^+_; ]+$/
        return hed3ValidValueCharacters.test(value)
      }
      checkDefinitionSyntax(tagGroup) {
        const definitionShortTag = 'definition'
        const defExpandShortTag = 'def-expand'
        const defShortTag = 'def'
        const definitionParentTags = getParsedParentTags(this.hedSchemas, definitionShortTag)
        const defExpandParentTags = getParsedParentTags(this.hedSchemas, defExpandShortTag)
        const defParentTags = getParsedParentTags(this.hedSchemas, defShortTag)
        let definitionTagFound = false
        let defExpandTagFound = false
        let definitionName
        for (const tag of tagGroup.tags) {
          if (tag instanceof ParsedHedGroup) {
            continue
          }
          if (tag.isDescendantOf(definitionParentTags.get(tag.schema))) {
            definitionTagFound = true
            definitionName = tag.originalTagName
            break
          } else if (tag.isDescendantOf(defExpandParentTags.get(tag.schema))) {
            defExpandTagFound = true
            definitionName = tag.originalTagName
            break
          }
        }
        if (!(definitionTagFound || defExpandTagFound)) {
          return
        }
        let tagGroupValidated = false
        let tagGroupIssueGenerated = false
        for (const tag of tagGroup.tags) {
          if (tag instanceof ParsedHedGroup) {
            if (tagGroupValidated && !tagGroupIssueGenerated) {
              this.pushIssue('multipleTagGroupsInDefinition', {
                definition: definitionName,
              })
              tagGroupIssueGenerated = true
              continue
            }
            tagGroupValidated = true
            for (const innerTag of tag.tagIterator()) {
              const nestedDefinitionParentTags = [
                definitionParentTags.get(innerTag.schema),
                defExpandParentTags.get(innerTag.schema),
                defParentTags.get(innerTag.schema),
              ]
              if (
                nestedDefinitionParentTags.some((parentTag) => {
                  return innerTag.isDescendantOf(parentTag)
                })
              ) {
                this.pushIssue('nestedDefinition', {
                  definition: definitionName,
                })
              }
            }
          } else if (
            (definitionTagFound && !tag.isDescendantOf(definitionParentTags.get(tag.schema))) ||
            (defExpandTagFound && !tag.isDescendantOf(defExpandParentTags.get(tag.schema)))
          ) {
            this.pushIssue('illegalDefinitionGroupTag', {
              tag: tag.originalTag,
              definition: definitionName,
            })
          }
        }
      }
      checkForMissingDefinitions(tag, defShortTag = 'Def') {
        const defParentTags = getParsedParentTags(this.hedSchemas, defShortTag)
        if (!tag.isDescendantOf(defParentTags.get(tag.schema))) {
          return
        }
        const defName = ParsedHedGroup.findDefinitionName(tag.canonicalTag, defShortTag)
        if (!this.definitions.has(defName)) {
          this.pushIssue('missingDefinition', { def: defName })
        }
      }
      checkForInvalidTopLevelTags() {
        for (const topLevelTag of this.parsedString.topLevelTags) {
          if (
            !utils.HED.hedStringIsAGroup(topLevelTag.formattedTag) &&
            (topLevelTag.hasAttribute(tagGroupType) || topLevelTag.parentHasAttribute(tagGroupType))
          ) {
            this.pushIssue('invalidTopLevelTag', {
              tag: topLevelTag.originalTag,
            })
          }
        }
      }
      checkForInvalidTopLevelTagGroupTags() {
        const topLevelTagGroupTagsFound = {}
        for (const tag of this.parsedString.tags) {
          if (tag.hasAttribute(topLevelTagGroupType) || tag.parentHasAttribute(topLevelTagGroupType)) {
            let tagFound = false
            this.parsedString.topLevelTagGroups.forEach((tagGroup, index) => {
              if (tagGroup.includes(tag)) {
                tagFound = true
                if (topLevelTagGroupTagsFound[index]) {
                  this.pushIssue('multipleTopLevelTagGroupTags', {
                    tag: tag.originalTag,
                    otherTag: topLevelTagGroupTagsFound[index],
                  })
                } else {
                  topLevelTagGroupTagsFound[index] = tag.originalTag
                }
              }
            })
            if (!tagFound) {
              this.pushIssue('invalidTopLevelTagGroupTag', {
                tag: tag.originalTag,
              })
            }
          }
        }
      }
    }
    module.exports = {
      Hed3Validator,
    }
  },
})

// validator/event/init.js
var require_init = __commonJS({
  'validator/event/init.js'(exports, module) {
    init_define_process()
    var { parseHedString } = require_main()
    var ParsedHedString = require_parsedHedString()
    var { Schemas } = require_schema()
    var { HedValidator, Hed2Validator } = require_validator()
    var { Hed3Validator } = require_hed3()
    var initiallyValidateHedString = function (hedString, hedSchemas, options, definitions = null) {
      const doSemanticValidation = hedSchemas instanceof Schemas
      if (!doSemanticValidation) {
        hedSchemas = new Schemas(null)
      }
      let parsedString, parsingIssues
      if (hedString instanceof ParsedHedString) {
        parsedString = hedString
        parsingIssues = { syntax: [], delimiter: [] }
      } else {
        ;[parsedString, parsingIssues] = parseHedString(hedString, hedSchemas)
      }
      if (parsedString === null) {
        return [null, [].concat(Object.values(parsingIssues)), null]
      } else if (parsingIssues.syntax.length + parsingIssues.delimiter.length > 0) {
        hedSchemas = new Schemas(null)
      }
      let hedValidator
      switch (hedSchemas.generation) {
        case 0:
          hedValidator = new HedValidator(parsedString, hedSchemas, options)
          break
        case 2:
          hedValidator = new Hed2Validator(parsedString, hedSchemas, options)
          break
        case 3:
          hedValidator = new Hed3Validator(parsedString, hedSchemas, definitions, options)
      }
      const allParsingIssues = [].concat(...Object.values(parsingIssues))
      return [parsedString, allParsingIssues, hedValidator]
    }
    var validateHedString = function (
      hedString,
      hedSchemas,
      checkForWarnings = false,
      expectValuePlaceholderString = false,
    ) {
      const [parsedString, parsedStringIssues, hedValidator] = initiallyValidateHedString(hedString, hedSchemas, {
        checkForWarnings,
        expectValuePlaceholderString,
      })
      if (parsedString === null) {
        return [false, parsedStringIssues]
      }
      hedValidator.validateStringLevel()
      const issues = [].concat(parsedStringIssues, hedValidator.issues)
      return [issues.length === 0, issues]
    }
    var validateHedEvent = function (hedString, hedSchemas, checkForWarnings = false) {
      const [parsedString, parsedStringIssues, hedValidator] = initiallyValidateHedString(hedString, hedSchemas, {
        checkForWarnings,
      })
      if (parsedString === null) {
        return [false, parsedStringIssues]
      }
      hedValidator.validateEventLevel()
      const issues = [].concat(parsedStringIssues, hedValidator.issues)
      return [issues.length === 0, issues]
    }
    var validateHedEventWithDefinitions = function (hedString, hedSchemas, definitions, checkForWarnings = false) {
      const [parsedString, parsedStringIssues, hedValidator] = initiallyValidateHedString(
        hedString,
        hedSchemas,
        { checkForWarnings },
        definitions,
      )
      if (parsedString === null) {
        return [false, parsedStringIssues]
      }
      hedValidator.validateEventLevel()
      const issues = [].concat(parsedStringIssues, hedValidator.issues)
      return [issues.length === 0, issues]
    }
    module.exports = {
      validateHedString,
      validateHedEvent,
      validateHedEventWithDefinitions,
    }
  },
})

// validator/event/index.js
var require_event = __commonJS({
  'validator/event/index.js'(exports, module) {
    init_define_process()
    var { validateHedString, validateHedEvent, validateHedEventWithDefinitions } = require_init()
    var { HedValidator, Hed2Validator } = require_validator()
    var { Hed3Validator } = require_hed3()
    module.exports = {
      HedValidator,
      Hed2Validator,
      Hed3Validator,
      validateHedString,
      validateHedEvent,
      validateHedEventWithDefinitions,
    }
  },
})

// node_modules/lodash/_stackClear.js
var require_stackClear = __commonJS({
  'node_modules/lodash/_stackClear.js'(exports, module) {
    init_define_process()
    var ListCache = require_ListCache()
    function stackClear() {
      this.__data__ = new ListCache()
      this.size = 0
    }
    module.exports = stackClear
  },
})

// node_modules/lodash/_stackDelete.js
var require_stackDelete = __commonJS({
  'node_modules/lodash/_stackDelete.js'(exports, module) {
    init_define_process()
    function stackDelete(key) {
      var data = this.__data__,
        result = data['delete'](key)
      this.size = data.size
      return result
    }
    module.exports = stackDelete
  },
})

// node_modules/lodash/_stackGet.js
var require_stackGet = __commonJS({
  'node_modules/lodash/_stackGet.js'(exports, module) {
    init_define_process()
    function stackGet(key) {
      return this.__data__.get(key)
    }
    module.exports = stackGet
  },
})

// node_modules/lodash/_stackHas.js
var require_stackHas = __commonJS({
  'node_modules/lodash/_stackHas.js'(exports, module) {
    init_define_process()
    function stackHas(key) {
      return this.__data__.has(key)
    }
    module.exports = stackHas
  },
})

// node_modules/lodash/_stackSet.js
var require_stackSet = __commonJS({
  'node_modules/lodash/_stackSet.js'(exports, module) {
    init_define_process()
    var ListCache = require_ListCache()
    var Map2 = require_Map()
    var MapCache = require_MapCache()
    var LARGE_ARRAY_SIZE = 200
    function stackSet(key, value) {
      var data = this.__data__
      if (data instanceof ListCache) {
        var pairs = data.__data__
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value])
          this.size = ++data.size
          return this
        }
        data = this.__data__ = new MapCache(pairs)
      }
      data.set(key, value)
      this.size = data.size
      return this
    }
    module.exports = stackSet
  },
})

// node_modules/lodash/_Stack.js
var require_Stack = __commonJS({
  'node_modules/lodash/_Stack.js'(exports, module) {
    init_define_process()
    var ListCache = require_ListCache()
    var stackClear = require_stackClear()
    var stackDelete = require_stackDelete()
    var stackGet = require_stackGet()
    var stackHas = require_stackHas()
    var stackSet = require_stackSet()
    function Stack(entries) {
      var data = (this.__data__ = new ListCache(entries))
      this.size = data.size
    }
    Stack.prototype.clear = stackClear
    Stack.prototype['delete'] = stackDelete
    Stack.prototype.get = stackGet
    Stack.prototype.has = stackHas
    Stack.prototype.set = stackSet
    module.exports = Stack
  },
})

// node_modules/lodash/_arraySome.js
var require_arraySome = __commonJS({
  'node_modules/lodash/_arraySome.js'(exports, module) {
    init_define_process()
    function arraySome(array, predicate) {
      var index = -1,
        length = array == null ? 0 : array.length
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true
        }
      }
      return false
    }
    module.exports = arraySome
  },
})

// node_modules/lodash/_equalArrays.js
var require_equalArrays = __commonJS({
  'node_modules/lodash/_equalArrays.js'(exports, module) {
    init_define_process()
    var SetCache = require_SetCache()
    var arraySome = require_arraySome()
    var cacheHas = require_cacheHas()
    var COMPARE_PARTIAL_FLAG = 1
    var COMPARE_UNORDERED_FLAG = 2
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
        arrLength = array.length,
        othLength = other.length
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false
      }
      var arrStacked = stack.get(array)
      var othStacked = stack.get(other)
      if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array
      }
      var index = -1,
        result = true,
        seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0
      stack.set(array, other)
      stack.set(other, array)
      while (++index < arrLength) {
        var arrValue = array[index],
          othValue = other[index]
        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack)
        }
        if (compared !== void 0) {
          if (compared) {
            continue
          }
          result = false
          break
        }
        if (seen) {
          if (
            !arraySome(other, function (othValue2, othIndex) {
              if (
                !cacheHas(seen, othIndex) &&
                (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))
              ) {
                return seen.push(othIndex)
              }
            })
          ) {
            result = false
            break
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false
          break
        }
      }
      stack['delete'](array)
      stack['delete'](other)
      return result
    }
    module.exports = equalArrays
  },
})

// node_modules/lodash/_Uint8Array.js
var require_Uint8Array = __commonJS({
  'node_modules/lodash/_Uint8Array.js'(exports, module) {
    init_define_process()
    var root = require_root()
    var Uint8Array2 = root.Uint8Array
    module.exports = Uint8Array2
  },
})

// node_modules/lodash/_mapToArray.js
var require_mapToArray = __commonJS({
  'node_modules/lodash/_mapToArray.js'(exports, module) {
    init_define_process()
    function mapToArray(map) {
      var index = -1,
        result = Array(map.size)
      map.forEach(function (value, key) {
        result[++index] = [key, value]
      })
      return result
    }
    module.exports = mapToArray
  },
})

// node_modules/lodash/_setToArray.js
var require_setToArray = __commonJS({
  'node_modules/lodash/_setToArray.js'(exports, module) {
    init_define_process()
    function setToArray(set) {
      var index = -1,
        result = Array(set.size)
      set.forEach(function (value) {
        result[++index] = value
      })
      return result
    }
    module.exports = setToArray
  },
})

// node_modules/lodash/_equalByTag.js
var require_equalByTag = __commonJS({
  'node_modules/lodash/_equalByTag.js'(exports, module) {
    init_define_process()
    var Symbol2 = require_Symbol()
    var Uint8Array2 = require_Uint8Array()
    var eq = require_eq()
    var equalArrays = require_equalArrays()
    var mapToArray = require_mapToArray()
    var setToArray = require_setToArray()
    var COMPARE_PARTIAL_FLAG = 1
    var COMPARE_UNORDERED_FLAG = 2
    var boolTag = '[object Boolean]'
    var dateTag = '[object Date]'
    var errorTag = '[object Error]'
    var mapTag = '[object Map]'
    var numberTag = '[object Number]'
    var regexpTag = '[object RegExp]'
    var setTag = '[object Set]'
    var stringTag = '[object String]'
    var symbolTag = '[object Symbol]'
    var arrayBufferTag = '[object ArrayBuffer]'
    var dataViewTag = '[object DataView]'
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0
    var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false
          }
          object = object.buffer
          other = other.buffer
        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
            return false
          }
          return true
        case boolTag:
        case dateTag:
        case numberTag:
          return eq(+object, +other)
        case errorTag:
          return object.name == other.name && object.message == other.message
        case regexpTag:
        case stringTag:
          return object == other + ''
        case mapTag:
          var convert = mapToArray
        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG
          convert || (convert = setToArray)
          if (object.size != other.size && !isPartial) {
            return false
          }
          var stacked = stack.get(object)
          if (stacked) {
            return stacked == other
          }
          bitmask |= COMPARE_UNORDERED_FLAG
          stack.set(object, other)
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack)
          stack['delete'](object)
          return result
        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other)
          }
      }
      return false
    }
    module.exports = equalByTag
  },
})

// node_modules/lodash/_baseGetAllKeys.js
var require_baseGetAllKeys = __commonJS({
  'node_modules/lodash/_baseGetAllKeys.js'(exports, module) {
    init_define_process()
    var arrayPush = require_arrayPush()
    var isArray = require_isArray()
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object)
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object))
    }
    module.exports = baseGetAllKeys
  },
})

// node_modules/lodash/_arrayFilter.js
var require_arrayFilter = __commonJS({
  'node_modules/lodash/_arrayFilter.js'(exports, module) {
    init_define_process()
    function arrayFilter(array, predicate) {
      var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = []
      while (++index < length) {
        var value = array[index]
        if (predicate(value, index, array)) {
          result[resIndex++] = value
        }
      }
      return result
    }
    module.exports = arrayFilter
  },
})

// node_modules/lodash/stubArray.js
var require_stubArray = __commonJS({
  'node_modules/lodash/stubArray.js'(exports, module) {
    init_define_process()
    function stubArray() {
      return []
    }
    module.exports = stubArray
  },
})

// node_modules/lodash/_getSymbols.js
var require_getSymbols = __commonJS({
  'node_modules/lodash/_getSymbols.js'(exports, module) {
    init_define_process()
    var arrayFilter = require_arrayFilter()
    var stubArray = require_stubArray()
    var objectProto = Object.prototype
    var propertyIsEnumerable = objectProto.propertyIsEnumerable
    var nativeGetSymbols = Object.getOwnPropertySymbols
    var getSymbols = !nativeGetSymbols
      ? stubArray
      : function (object) {
          if (object == null) {
            return []
          }
          object = Object(object)
          return arrayFilter(nativeGetSymbols(object), function (symbol) {
            return propertyIsEnumerable.call(object, symbol)
          })
        }
    module.exports = getSymbols
  },
})

// node_modules/lodash/_baseTimes.js
var require_baseTimes = __commonJS({
  'node_modules/lodash/_baseTimes.js'(exports, module) {
    init_define_process()
    function baseTimes(n, iteratee) {
      var index = -1,
        result = Array(n)
      while (++index < n) {
        result[index] = iteratee(index)
      }
      return result
    }
    module.exports = baseTimes
  },
})

// node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS({
  'node_modules/lodash/stubFalse.js'(exports, module) {
    init_define_process()
    function stubFalse() {
      return false
    }
    module.exports = stubFalse
  },
})

// node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS({
  'node_modules/lodash/isBuffer.js'(exports, module) {
    init_define_process()
    var root = require_root()
    var stubFalse = require_stubFalse()
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module
    var moduleExports = freeModule && freeModule.exports === freeExports
    var Buffer2 = moduleExports ? root.Buffer : void 0
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0
    var isBuffer = nativeIsBuffer || stubFalse
    module.exports = isBuffer
  },
})

// node_modules/lodash/_isIndex.js
var require_isIndex = __commonJS({
  'node_modules/lodash/_isIndex.js'(exports, module) {
    init_define_process()
    var MAX_SAFE_INTEGER = 9007199254740991
    var reIsUint = /^(?:0|[1-9]\d*)$/
    function isIndex(value, length) {
      var type = typeof value
      length = length == null ? MAX_SAFE_INTEGER : length
      return (
        !!length &&
        (type == 'number' || (type != 'symbol' && reIsUint.test(value))) &&
        value > -1 &&
        value % 1 == 0 &&
        value < length
      )
    }
    module.exports = isIndex
  },
})

// node_modules/lodash/_baseIsTypedArray.js
var require_baseIsTypedArray = __commonJS({
  'node_modules/lodash/_baseIsTypedArray.js'(exports, module) {
    init_define_process()
    var baseGetTag = require_baseGetTag()
    var isLength = require_isLength()
    var isObjectLike = require_isObjectLike()
    var argsTag = '[object Arguments]'
    var arrayTag = '[object Array]'
    var boolTag = '[object Boolean]'
    var dateTag = '[object Date]'
    var errorTag = '[object Error]'
    var funcTag = '[object Function]'
    var mapTag = '[object Map]'
    var numberTag = '[object Number]'
    var objectTag = '[object Object]'
    var regexpTag = '[object RegExp]'
    var setTag = '[object Set]'
    var stringTag = '[object String]'
    var weakMapTag = '[object WeakMap]'
    var arrayBufferTag = '[object ArrayBuffer]'
    var dataViewTag = '[object DataView]'
    var float32Tag = '[object Float32Array]'
    var float64Tag = '[object Float64Array]'
    var int8Tag = '[object Int8Array]'
    var int16Tag = '[object Int16Array]'
    var int32Tag = '[object Int32Array]'
    var uint8Tag = '[object Uint8Array]'
    var uint8ClampedTag = '[object Uint8ClampedArray]'
    var uint16Tag = '[object Uint16Array]'
    var uint32Tag = '[object Uint32Array]'
    var typedArrayTags = {}
    typedArrayTags[float32Tag] =
      typedArrayTags[float64Tag] =
      typedArrayTags[int8Tag] =
      typedArrayTags[int16Tag] =
      typedArrayTags[int32Tag] =
      typedArrayTags[uint8Tag] =
      typedArrayTags[uint8ClampedTag] =
      typedArrayTags[uint16Tag] =
      typedArrayTags[uint32Tag] =
        true
    typedArrayTags[argsTag] =
      typedArrayTags[arrayTag] =
      typedArrayTags[arrayBufferTag] =
      typedArrayTags[boolTag] =
      typedArrayTags[dataViewTag] =
      typedArrayTags[dateTag] =
      typedArrayTags[errorTag] =
      typedArrayTags[funcTag] =
      typedArrayTags[mapTag] =
      typedArrayTags[numberTag] =
      typedArrayTags[objectTag] =
      typedArrayTags[regexpTag] =
      typedArrayTags[setTag] =
      typedArrayTags[stringTag] =
      typedArrayTags[weakMapTag] =
        false
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)]
    }
    module.exports = baseIsTypedArray
  },
})

// node_modules/lodash/_nodeUtil.js
var require_nodeUtil = __commonJS({
  'node_modules/lodash/_nodeUtil.js'(exports, module) {
    init_define_process()
    var freeGlobal = require_freeGlobal()
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module
    var moduleExports = freeModule && freeModule.exports === freeExports
    var freeProcess = moduleExports && freeGlobal.process
    var nodeUtil = (function () {
      try {
        var types = freeModule && freeModule.require && freeModule.require('util').types
        if (types) {
          return types
        }
        return freeProcess && freeProcess.binding && freeProcess.binding('util')
      } catch (e) {}
    })()
    module.exports = nodeUtil
  },
})

// node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS({
  'node_modules/lodash/isTypedArray.js'(exports, module) {
    init_define_process()
    var baseIsTypedArray = require_baseIsTypedArray()
    var baseUnary = require_baseUnary()
    var nodeUtil = require_nodeUtil()
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray
    module.exports = isTypedArray
  },
})

// node_modules/lodash/_arrayLikeKeys.js
var require_arrayLikeKeys = __commonJS({
  'node_modules/lodash/_arrayLikeKeys.js'(exports, module) {
    init_define_process()
    var baseTimes = require_baseTimes()
    var isArguments = require_isArguments()
    var isArray = require_isArray()
    var isBuffer = require_isBuffer()
    var isIndex = require_isIndex()
    var isTypedArray = require_isTypedArray()
    var objectProto = Object.prototype
    var hasOwnProperty = objectProto.hasOwnProperty
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length
      for (var key in value) {
        if (
          (inherited || hasOwnProperty.call(value, key)) &&
          !(
            skipIndexes &&
            (key == 'length' ||
              (isBuff && (key == 'offset' || key == 'parent')) ||
              (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
              isIndex(key, length))
          )
        ) {
          result.push(key)
        }
      }
      return result
    }
    module.exports = arrayLikeKeys
  },
})

// node_modules/lodash/_isPrototype.js
var require_isPrototype = __commonJS({
  'node_modules/lodash/_isPrototype.js'(exports, module) {
    init_define_process()
    var objectProto = Object.prototype
    function isPrototype(value) {
      var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto
      return value === proto
    }
    module.exports = isPrototype
  },
})

// node_modules/lodash/_overArg.js
var require_overArg = __commonJS({
  'node_modules/lodash/_overArg.js'(exports, module) {
    init_define_process()
    function overArg(func, transform) {
      return function (arg) {
        return func(transform(arg))
      }
    }
    module.exports = overArg
  },
})

// node_modules/lodash/_nativeKeys.js
var require_nativeKeys = __commonJS({
  'node_modules/lodash/_nativeKeys.js'(exports, module) {
    init_define_process()
    var overArg = require_overArg()
    var nativeKeys = overArg(Object.keys, Object)
    module.exports = nativeKeys
  },
})

// node_modules/lodash/_baseKeys.js
var require_baseKeys = __commonJS({
  'node_modules/lodash/_baseKeys.js'(exports, module) {
    init_define_process()
    var isPrototype = require_isPrototype()
    var nativeKeys = require_nativeKeys()
    var objectProto = Object.prototype
    var hasOwnProperty = objectProto.hasOwnProperty
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object)
      }
      var result = []
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != 'constructor') {
          result.push(key)
        }
      }
      return result
    }
    module.exports = baseKeys
  },
})

// node_modules/lodash/keys.js
var require_keys = __commonJS({
  'node_modules/lodash/keys.js'(exports, module) {
    init_define_process()
    var arrayLikeKeys = require_arrayLikeKeys()
    var baseKeys = require_baseKeys()
    var isArrayLike = require_isArrayLike()
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object)
    }
    module.exports = keys
  },
})

// node_modules/lodash/_getAllKeys.js
var require_getAllKeys = __commonJS({
  'node_modules/lodash/_getAllKeys.js'(exports, module) {
    init_define_process()
    var baseGetAllKeys = require_baseGetAllKeys()
    var getSymbols = require_getSymbols()
    var keys = require_keys()
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols)
    }
    module.exports = getAllKeys
  },
})

// node_modules/lodash/_equalObjects.js
var require_equalObjects = __commonJS({
  'node_modules/lodash/_equalObjects.js'(exports, module) {
    init_define_process()
    var getAllKeys = require_getAllKeys()
    var COMPARE_PARTIAL_FLAG = 1
    var objectProto = Object.prototype
    var hasOwnProperty = objectProto.hasOwnProperty
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
        objProps = getAllKeys(object),
        objLength = objProps.length,
        othProps = getAllKeys(other),
        othLength = othProps.length
      if (objLength != othLength && !isPartial) {
        return false
      }
      var index = objLength
      while (index--) {
        var key = objProps[index]
        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false
        }
      }
      var objStacked = stack.get(object)
      var othStacked = stack.get(other)
      if (objStacked && othStacked) {
        return objStacked == other && othStacked == object
      }
      var result = true
      stack.set(object, other)
      stack.set(other, object)
      var skipCtor = isPartial
      while (++index < objLength) {
        key = objProps[index]
        var objValue = object[key],
          othValue = other[key]
        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack)
        }
        if (
          !(compared === void 0
            ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack)
            : compared)
        ) {
          result = false
          break
        }
        skipCtor || (skipCtor = key == 'constructor')
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
          othCtor = other.constructor
        if (
          objCtor != othCtor &&
          'constructor' in object &&
          'constructor' in other &&
          !(
            typeof objCtor == 'function' &&
            objCtor instanceof objCtor &&
            typeof othCtor == 'function' &&
            othCtor instanceof othCtor
          )
        ) {
          result = false
        }
      }
      stack['delete'](object)
      stack['delete'](other)
      return result
    }
    module.exports = equalObjects
  },
})

// node_modules/lodash/_DataView.js
var require_DataView = __commonJS({
  'node_modules/lodash/_DataView.js'(exports, module) {
    init_define_process()
    var getNative = require_getNative()
    var root = require_root()
    var DataView2 = getNative(root, 'DataView')
    module.exports = DataView2
  },
})

// node_modules/lodash/_Promise.js
var require_Promise = __commonJS({
  'node_modules/lodash/_Promise.js'(exports, module) {
    init_define_process()
    var getNative = require_getNative()
    var root = require_root()
    var Promise2 = getNative(root, 'Promise')
    module.exports = Promise2
  },
})

// node_modules/lodash/_Set.js
var require_Set = __commonJS({
  'node_modules/lodash/_Set.js'(exports, module) {
    init_define_process()
    var getNative = require_getNative()
    var root = require_root()
    var Set2 = getNative(root, 'Set')
    module.exports = Set2
  },
})

// node_modules/lodash/_WeakMap.js
var require_WeakMap = __commonJS({
  'node_modules/lodash/_WeakMap.js'(exports, module) {
    init_define_process()
    var getNative = require_getNative()
    var root = require_root()
    var WeakMap2 = getNative(root, 'WeakMap')
    module.exports = WeakMap2
  },
})

// node_modules/lodash/_getTag.js
var require_getTag = __commonJS({
  'node_modules/lodash/_getTag.js'(exports, module) {
    init_define_process()
    var DataView2 = require_DataView()
    var Map2 = require_Map()
    var Promise2 = require_Promise()
    var Set2 = require_Set()
    var WeakMap2 = require_WeakMap()
    var baseGetTag = require_baseGetTag()
    var toSource = require_toSource()
    var mapTag = '[object Map]'
    var objectTag = '[object Object]'
    var promiseTag = '[object Promise]'
    var setTag = '[object Set]'
    var weakMapTag = '[object WeakMap]'
    var dataViewTag = '[object DataView]'
    var dataViewCtorString = toSource(DataView2)
    var mapCtorString = toSource(Map2)
    var promiseCtorString = toSource(Promise2)
    var setCtorString = toSource(Set2)
    var weakMapCtorString = toSource(WeakMap2)
    var getTag = baseGetTag
    if (
      (DataView2 && getTag(new DataView2(new ArrayBuffer(1))) != dataViewTag) ||
      (Map2 && getTag(new Map2()) != mapTag) ||
      (Promise2 && getTag(Promise2.resolve()) != promiseTag) ||
      (Set2 && getTag(new Set2()) != setTag) ||
      (WeakMap2 && getTag(new WeakMap2()) != weakMapTag)
    ) {
      getTag = function (value) {
        var result = baseGetTag(value),
          Ctor = result == objectTag ? value.constructor : void 0,
          ctorString = Ctor ? toSource(Ctor) : ''
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag
            case mapCtorString:
              return mapTag
            case promiseCtorString:
              return promiseTag
            case setCtorString:
              return setTag
            case weakMapCtorString:
              return weakMapTag
          }
        }
        return result
      }
    }
    module.exports = getTag
  },
})

// node_modules/lodash/_baseIsEqualDeep.js
var require_baseIsEqualDeep = __commonJS({
  'node_modules/lodash/_baseIsEqualDeep.js'(exports, module) {
    init_define_process()
    var Stack = require_Stack()
    var equalArrays = require_equalArrays()
    var equalByTag = require_equalByTag()
    var equalObjects = require_equalObjects()
    var getTag = require_getTag()
    var isArray = require_isArray()
    var isBuffer = require_isBuffer()
    var isTypedArray = require_isTypedArray()
    var COMPARE_PARTIAL_FLAG = 1
    var argsTag = '[object Arguments]'
    var arrayTag = '[object Array]'
    var objectTag = '[object Object]'
    var objectProto = Object.prototype
    var hasOwnProperty = objectProto.hasOwnProperty
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object),
        othIsArr = isArray(other),
        objTag = objIsArr ? arrayTag : getTag(object),
        othTag = othIsArr ? arrayTag : getTag(other)
      objTag = objTag == argsTag ? objectTag : objTag
      othTag = othTag == argsTag ? objectTag : othTag
      var objIsObj = objTag == objectTag,
        othIsObj = othTag == objectTag,
        isSameTag = objTag == othTag
      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false
        }
        objIsArr = true
        objIsObj = false
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack())
        return objIsArr || isTypedArray(object)
          ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
          : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack)
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__')
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
            othUnwrapped = othIsWrapped ? other.value() : other
          stack || (stack = new Stack())
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack)
        }
      }
      if (!isSameTag) {
        return false
      }
      stack || (stack = new Stack())
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack)
    }
    module.exports = baseIsEqualDeep
  },
})

// node_modules/lodash/_baseIsEqual.js
var require_baseIsEqual = __commonJS({
  'node_modules/lodash/_baseIsEqual.js'(exports, module) {
    init_define_process()
    var baseIsEqualDeep = require_baseIsEqualDeep()
    var isObjectLike = require_isObjectLike()
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true
      }
      if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
        return value !== value && other !== other
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack)
    }
    module.exports = baseIsEqual
  },
})

// node_modules/lodash/isEqual.js
var require_isEqual = __commonJS({
  'node_modules/lodash/isEqual.js'(exports, module) {
    init_define_process()
    var baseIsEqual = require_baseIsEqual()
    function isEqual(value, other) {
      return baseIsEqual(value, other)
    }
    module.exports = isEqual
  },
})

// utils/map.js
var require_map = __commonJS({
  'utils/map.js'(exports, module) {
    init_define_process()
    var isEqual = require_isEqual()
    var filterNonEqualDuplicates = function (list, equalityFunction = isEqual) {
      const map = /* @__PURE__ */ new Map()
      const duplicateKeySet = /* @__PURE__ */ new Set()
      const duplicates = []
      for (const [key, value] of list) {
        if (!map.has(key)) {
          map.set(key, value)
        } else if (!equalityFunction(map.get(key), value)) {
          duplicates.push([key, value])
          duplicateKeySet.add(key)
        }
      }
      for (const key of duplicateKeySet) {
        const value = map.get(key)
        map.delete(key)
        duplicates.push([key, value])
      }
      return [map, duplicates]
    }
    module.exports = {
      filterNonEqualDuplicates,
    }
  },
})

// validator/dataset.js
var require_dataset = __commonJS({
  'validator/dataset.js'(exports, module) {
    init_define_process()
    var { validateHedEventWithDefinitions } = require_event()
    var { parseHedStrings } = require_main()
    var { generateIssue } = require_issues()
    var { filterNonEqualDuplicates } = require_map()
    var parseDefinitions = function (parsedHedStrings) {
      const issues = []
      const parsedHedStringDefinitions = parsedHedStrings.flatMap((parsedHedString) => {
        return parsedHedString.definitions
      })
      const [definitionMap, definitionDuplicates] = filterNonEqualDuplicates(
        parsedHedStringDefinitions,
        (definition, other) => {
          return definition.equivalent(other)
        },
      )
      for (const [duplicateKey, duplicateValue] of definitionDuplicates) {
        issues.push(
          generateIssue('duplicateDefinition', {
            definition: duplicateKey,
            tagGroup: duplicateValue.originalTag,
          }),
        )
      }
      return [definitionMap, issues]
    }
    var validateDataset = function (definitions, hedStrings, hedSchemas) {
      return [true, []]
    }
    var validateHedEvents = function (parsedHedStrings, hedSchemas, definitions, checkForWarnings) {
      let stringsValid = true
      let stringIssues = []
      for (const hedString of parsedHedStrings) {
        const [valid, issues] = validateHedEventWithDefinitions(hedString, hedSchemas, definitions, checkForWarnings)
        stringsValid = stringsValid && valid
        stringIssues = stringIssues.concat(issues)
      }
      return [stringsValid, stringIssues]
    }
    var validateHedDataset = function (hedStrings, hedSchemas, checkForWarnings = false) {
      if (hedStrings.length === 0) {
        return [true, []]
      }
      const [parsedHedStrings, parsingIssues] = parseHedStrings(hedStrings, hedSchemas)
      const [definitions, definitionIssues] = parseDefinitions(parsedHedStrings)
      const [stringsValid, stringIssues] = validateHedEvents(
        parsedHedStrings,
        hedSchemas,
        definitions,
        checkForWarnings,
      )
      const issues = stringIssues.concat(...Object.values(parsingIssues))
      if (!stringsValid) {
        return [false, issues]
      }
      return [definitionIssues.length === 0, definitionIssues.concat(issues)]
    }
    var validateHedDatasetWithContext = function (hedStrings, contextHedStrings, hedSchemas, checkForWarnings = false) {
      if (hedStrings.length + contextHedStrings.length === 0) {
        return [true, []]
      }
      const [parsedHedStrings, parsingIssues] = parseHedStrings(hedStrings, hedSchemas)
      const [parsedContextHedStrings, contextParsingIssues] = parseHedStrings(contextHedStrings, hedSchemas)
      const combinedParsedHedStrings = parsedHedStrings.concat(parsedContextHedStrings)
      const [definitions, definitionIssues] = parseDefinitions(combinedParsedHedStrings)
      const [stringsValid, stringIssues] = validateHedEvents(
        parsedHedStrings,
        hedSchemas,
        definitions,
        checkForWarnings,
      )
      const issues = stringIssues.concat(...Object.values(parsingIssues), ...Object.values(contextParsingIssues))
      if (!stringsValid) {
        return [false, issues]
      }
      return [definitionIssues.length === 0, definitionIssues.concat(issues)]
    }
    module.exports = {
      parseDefinitions,
      validateDataset,
      validateHedEvents,
      validateHedDataset,
      validateHedDatasetWithContext,
    }
  },
})

// node_modules/semver/functions/parse.js
var require_parse2 = __commonJS({
  'node_modules/semver/functions/parse.js'(exports, module) {
    init_define_process()
    var { MAX_LENGTH } = require_constants()
    var { re, t } = require_re()
    var SemVer = require_semver()
    var parseOptions = require_parse_options()
    var parse = (version, options) => {
      options = parseOptions(options)
      if (version instanceof SemVer) {
        return version
      }
      if (typeof version !== 'string') {
        return null
      }
      if (version.length > MAX_LENGTH) {
        return null
      }
      const r = options.loose ? re[t.LOOSE] : re[t.FULL]
      if (!r.test(version)) {
        return null
      }
      try {
        return new SemVer(version, options)
      } catch (er) {
        return null
      }
    }
    module.exports = parse
  },
})

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  'node_modules/semver/functions/valid.js'(exports, module) {
    init_define_process()
    var parse = require_parse2()
    var valid = (version, options) => {
      const v = parse(version, options)
      return v ? v.version : null
    }
    module.exports = valid
  },
})

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  'node_modules/semver/functions/clean.js'(exports, module) {
    init_define_process()
    var parse = require_parse2()
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ''), options)
      return s ? s.version : null
    }
    module.exports = clean
  },
})

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  'node_modules/semver/functions/inc.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var inc = (version, release, options, identifier) => {
      if (typeof options === 'string') {
        identifier = options
        options = void 0
      }
      try {
        return new SemVer(version, options).inc(release, identifier).version
      } catch (er) {
        return null
      }
    }
    module.exports = inc
  },
})

// node_modules/semver/functions/eq.js
var require_eq2 = __commonJS({
  'node_modules/semver/functions/eq.js'(exports, module) {
    init_define_process()
    var compare = require_compare()
    var eq = (a, b, loose) => compare(a, b, loose) === 0
    module.exports = eq
  },
})

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  'node_modules/semver/functions/diff.js'(exports, module) {
    init_define_process()
    var parse = require_parse2()
    var eq = require_eq2()
    var diff = (version1, version2) => {
      if (eq(version1, version2)) {
        return null
      } else {
        const v1 = parse(version1)
        const v2 = parse(version2)
        const hasPre = v1.prerelease.length || v2.prerelease.length
        const prefix = hasPre ? 'pre' : ''
        const defaultResult = hasPre ? 'prerelease' : ''
        for (const key in v1) {
          if (key === 'major' || key === 'minor' || key === 'patch') {
            if (v1[key] !== v2[key]) {
              return prefix + key
            }
          }
        }
        return defaultResult
      }
    }
    module.exports = diff
  },
})

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  'node_modules/semver/functions/major.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var major = (a, loose) => new SemVer(a, loose).major
    module.exports = major
  },
})

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  'node_modules/semver/functions/minor.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var minor = (a, loose) => new SemVer(a, loose).minor
    module.exports = minor
  },
})

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  'node_modules/semver/functions/patch.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var patch = (a, loose) => new SemVer(a, loose).patch
    module.exports = patch
  },
})

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  'node_modules/semver/functions/prerelease.js'(exports, module) {
    init_define_process()
    var parse = require_parse2()
    var prerelease = (version, options) => {
      const parsed = parse(version, options)
      return parsed && parsed.prerelease.length ? parsed.prerelease : null
    }
    module.exports = prerelease
  },
})

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  'node_modules/semver/functions/rcompare.js'(exports, module) {
    init_define_process()
    var compare = require_compare()
    var rcompare = (a, b, loose) => compare(b, a, loose)
    module.exports = rcompare
  },
})

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  'node_modules/semver/functions/compare-loose.js'(exports, module) {
    init_define_process()
    var compare = require_compare()
    var compareLoose = (a, b) => compare(a, b, true)
    module.exports = compareLoose
  },
})

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  'node_modules/semver/functions/compare-build.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose)
      const versionB = new SemVer(b, loose)
      return versionA.compare(versionB) || versionA.compareBuild(versionB)
    }
    module.exports = compareBuild
  },
})

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  'node_modules/semver/functions/sort.js'(exports, module) {
    init_define_process()
    var compareBuild = require_compare_build()
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose))
    module.exports = sort
  },
})

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  'node_modules/semver/functions/rsort.js'(exports, module) {
    init_define_process()
    var compareBuild = require_compare_build()
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose))
    module.exports = rsort
  },
})

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  'node_modules/semver/functions/gt.js'(exports, module) {
    init_define_process()
    var compare = require_compare()
    var gt = (a, b, loose) => compare(a, b, loose) > 0
    module.exports = gt
  },
})

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  'node_modules/semver/functions/neq.js'(exports, module) {
    init_define_process()
    var compare = require_compare()
    var neq = (a, b, loose) => compare(a, b, loose) !== 0
    module.exports = neq
  },
})

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  'node_modules/semver/functions/gte.js'(exports, module) {
    init_define_process()
    var compare = require_compare()
    var gte = (a, b, loose) => compare(a, b, loose) >= 0
    module.exports = gte
  },
})

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  'node_modules/semver/functions/lte.js'(exports, module) {
    init_define_process()
    var compare = require_compare()
    var lte = (a, b, loose) => compare(a, b, loose) <= 0
    module.exports = lte
  },
})

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  'node_modules/semver/functions/cmp.js'(exports, module) {
    init_define_process()
    var eq = require_eq2()
    var neq = require_neq()
    var gt = require_gt()
    var gte = require_gte()
    var lt = require_lt()
    var lte = require_lte()
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case '===':
          if (typeof a === 'object') a = a.version
          if (typeof b === 'object') b = b.version
          return a === b
        case '!==':
          if (typeof a === 'object') a = a.version
          if (typeof b === 'object') b = b.version
          return a !== b
        case '':
        case '=':
        case '==':
          return eq(a, b, loose)
        case '!=':
          return neq(a, b, loose)
        case '>':
          return gt(a, b, loose)
        case '>=':
          return gte(a, b, loose)
        case '<':
          return lt(a, b, loose)
        case '<=':
          return lte(a, b, loose)
        default:
          throw new TypeError(`Invalid operator: ${op}`)
      }
    }
    module.exports = cmp
  },
})

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  'node_modules/semver/functions/coerce.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var parse = require_parse2()
    var { re, t } = require_re()
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version
      }
      if (typeof version === 'number') {
        version = String(version)
      }
      if (typeof version !== 'string') {
        return null
      }
      options = options || {}
      let match = null
      if (!options.rtl) {
        match = version.match(re[t.COERCE])
      } else {
        let next
        while ((next = re[t.COERCERTL].exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next
          }
          re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length
        }
        re[t.COERCERTL].lastIndex = -1
      }
      if (match === null) return null
      return parse(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options)
    }
    module.exports = coerce
  },
})

// node_modules/yallist/iterator.js
var require_iterator = __commonJS({
  'node_modules/yallist/iterator.js'(exports, module) {
    'use strict'
    init_define_process()
    module.exports = function (Yallist) {
      Yallist.prototype[Symbol.iterator] = function* () {
        for (let walker = this.head; walker; walker = walker.next) {
          yield walker.value
        }
      }
    }
  },
})

// node_modules/yallist/yallist.js
var require_yallist = __commonJS({
  'node_modules/yallist/yallist.js'(exports, module) {
    'use strict'
    init_define_process()
    module.exports = Yallist
    Yallist.Node = Node
    Yallist.create = Yallist
    function Yallist(list) {
      var self2 = this
      if (!(self2 instanceof Yallist)) {
        self2 = new Yallist()
      }
      self2.tail = null
      self2.head = null
      self2.length = 0
      if (list && typeof list.forEach === 'function') {
        list.forEach(function (item) {
          self2.push(item)
        })
      } else if (arguments.length > 0) {
        for (var i = 0, l = arguments.length; i < l; i++) {
          self2.push(arguments[i])
        }
      }
      return self2
    }
    Yallist.prototype.removeNode = function (node) {
      if (node.list !== this) {
        throw new Error('removing node which does not belong to this list')
      }
      var next = node.next
      var prev = node.prev
      if (next) {
        next.prev = prev
      }
      if (prev) {
        prev.next = next
      }
      if (node === this.head) {
        this.head = next
      }
      if (node === this.tail) {
        this.tail = prev
      }
      node.list.length--
      node.next = null
      node.prev = null
      node.list = null
      return next
    }
    Yallist.prototype.unshiftNode = function (node) {
      if (node === this.head) {
        return
      }
      if (node.list) {
        node.list.removeNode(node)
      }
      var head = this.head
      node.list = this
      node.next = head
      if (head) {
        head.prev = node
      }
      this.head = node
      if (!this.tail) {
        this.tail = node
      }
      this.length++
    }
    Yallist.prototype.pushNode = function (node) {
      if (node === this.tail) {
        return
      }
      if (node.list) {
        node.list.removeNode(node)
      }
      var tail = this.tail
      node.list = this
      node.prev = tail
      if (tail) {
        tail.next = node
      }
      this.tail = node
      if (!this.head) {
        this.head = node
      }
      this.length++
    }
    Yallist.prototype.push = function () {
      for (var i = 0, l = arguments.length; i < l; i++) {
        push(this, arguments[i])
      }
      return this.length
    }
    Yallist.prototype.unshift = function () {
      for (var i = 0, l = arguments.length; i < l; i++) {
        unshift(this, arguments[i])
      }
      return this.length
    }
    Yallist.prototype.pop = function () {
      if (!this.tail) {
        return void 0
      }
      var res = this.tail.value
      this.tail = this.tail.prev
      if (this.tail) {
        this.tail.next = null
      } else {
        this.head = null
      }
      this.length--
      return res
    }
    Yallist.prototype.shift = function () {
      if (!this.head) {
        return void 0
      }
      var res = this.head.value
      this.head = this.head.next
      if (this.head) {
        this.head.prev = null
      } else {
        this.tail = null
      }
      this.length--
      return res
    }
    Yallist.prototype.forEach = function (fn, thisp) {
      thisp = thisp || this
      for (var walker = this.head, i = 0; walker !== null; i++) {
        fn.call(thisp, walker.value, i, this)
        walker = walker.next
      }
    }
    Yallist.prototype.forEachReverse = function (fn, thisp) {
      thisp = thisp || this
      for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
        fn.call(thisp, walker.value, i, this)
        walker = walker.prev
      }
    }
    Yallist.prototype.get = function (n) {
      for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
        walker = walker.next
      }
      if (i === n && walker !== null) {
        return walker.value
      }
    }
    Yallist.prototype.getReverse = function (n) {
      for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
        walker = walker.prev
      }
      if (i === n && walker !== null) {
        return walker.value
      }
    }
    Yallist.prototype.map = function (fn, thisp) {
      thisp = thisp || this
      var res = new Yallist()
      for (var walker = this.head; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this))
        walker = walker.next
      }
      return res
    }
    Yallist.prototype.mapReverse = function (fn, thisp) {
      thisp = thisp || this
      var res = new Yallist()
      for (var walker = this.tail; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this))
        walker = walker.prev
      }
      return res
    }
    Yallist.prototype.reduce = function (fn, initial) {
      var acc
      var walker = this.head
      if (arguments.length > 1) {
        acc = initial
      } else if (this.head) {
        walker = this.head.next
        acc = this.head.value
      } else {
        throw new TypeError('Reduce of empty list with no initial value')
      }
      for (var i = 0; walker !== null; i++) {
        acc = fn(acc, walker.value, i)
        walker = walker.next
      }
      return acc
    }
    Yallist.prototype.reduceReverse = function (fn, initial) {
      var acc
      var walker = this.tail
      if (arguments.length > 1) {
        acc = initial
      } else if (this.tail) {
        walker = this.tail.prev
        acc = this.tail.value
      } else {
        throw new TypeError('Reduce of empty list with no initial value')
      }
      for (var i = this.length - 1; walker !== null; i--) {
        acc = fn(acc, walker.value, i)
        walker = walker.prev
      }
      return acc
    }
    Yallist.prototype.toArray = function () {
      var arr = new Array(this.length)
      for (var i = 0, walker = this.head; walker !== null; i++) {
        arr[i] = walker.value
        walker = walker.next
      }
      return arr
    }
    Yallist.prototype.toArrayReverse = function () {
      var arr = new Array(this.length)
      for (var i = 0, walker = this.tail; walker !== null; i++) {
        arr[i] = walker.value
        walker = walker.prev
      }
      return arr
    }
    Yallist.prototype.slice = function (from, to) {
      to = to || this.length
      if (to < 0) {
        to += this.length
      }
      from = from || 0
      if (from < 0) {
        from += this.length
      }
      var ret = new Yallist()
      if (to < from || to < 0) {
        return ret
      }
      if (from < 0) {
        from = 0
      }
      if (to > this.length) {
        to = this.length
      }
      for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
        walker = walker.next
      }
      for (; walker !== null && i < to; i++, walker = walker.next) {
        ret.push(walker.value)
      }
      return ret
    }
    Yallist.prototype.sliceReverse = function (from, to) {
      to = to || this.length
      if (to < 0) {
        to += this.length
      }
      from = from || 0
      if (from < 0) {
        from += this.length
      }
      var ret = new Yallist()
      if (to < from || to < 0) {
        return ret
      }
      if (from < 0) {
        from = 0
      }
      if (to > this.length) {
        to = this.length
      }
      for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
        walker = walker.prev
      }
      for (; walker !== null && i > from; i--, walker = walker.prev) {
        ret.push(walker.value)
      }
      return ret
    }
    Yallist.prototype.splice = function (start, deleteCount, ...nodes) {
      if (start > this.length) {
        start = this.length - 1
      }
      if (start < 0) {
        start = this.length + start
      }
      for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
        walker = walker.next
      }
      var ret = []
      for (var i = 0; walker && i < deleteCount; i++) {
        ret.push(walker.value)
        walker = this.removeNode(walker)
      }
      if (walker === null) {
        walker = this.tail
      }
      if (walker !== this.head && walker !== this.tail) {
        walker = walker.prev
      }
      for (var i = 0; i < nodes.length; i++) {
        walker = insert(this, walker, nodes[i])
      }
      return ret
    }
    Yallist.prototype.reverse = function () {
      var head = this.head
      var tail = this.tail
      for (var walker = head; walker !== null; walker = walker.prev) {
        var p = walker.prev
        walker.prev = walker.next
        walker.next = p
      }
      this.head = tail
      this.tail = head
      return this
    }
    function insert(self2, node, value) {
      var inserted = node === self2.head ? new Node(value, null, node, self2) : new Node(value, node, node.next, self2)
      if (inserted.next === null) {
        self2.tail = inserted
      }
      if (inserted.prev === null) {
        self2.head = inserted
      }
      self2.length++
      return inserted
    }
    function push(self2, item) {
      self2.tail = new Node(item, self2.tail, null, self2)
      if (!self2.head) {
        self2.head = self2.tail
      }
      self2.length++
    }
    function unshift(self2, item) {
      self2.head = new Node(item, null, self2.head, self2)
      if (!self2.tail) {
        self2.tail = self2.head
      }
      self2.length++
    }
    function Node(value, prev, next, list) {
      if (!(this instanceof Node)) {
        return new Node(value, prev, next, list)
      }
      this.list = list
      this.value = value
      if (prev) {
        prev.next = this
        this.prev = prev
      } else {
        this.prev = null
      }
      if (next) {
        next.prev = this
        this.next = next
      } else {
        this.next = null
      }
    }
    try {
      require_iterator()(Yallist)
    } catch (er) {}
  },
})

// node_modules/lru-cache/index.js
var require_lru_cache = __commonJS({
  'node_modules/lru-cache/index.js'(exports, module) {
    'use strict'
    init_define_process()
    var Yallist = require_yallist()
    var MAX = Symbol('max')
    var LENGTH = Symbol('length')
    var LENGTH_CALCULATOR = Symbol('lengthCalculator')
    var ALLOW_STALE = Symbol('allowStale')
    var MAX_AGE = Symbol('maxAge')
    var DISPOSE = Symbol('dispose')
    var NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet')
    var LRU_LIST = Symbol('lruList')
    var CACHE = Symbol('cache')
    var UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet')
    var naiveLength = () => 1
    var LRUCache = class {
      constructor(options) {
        if (typeof options === 'number') options = { max: options }
        if (!options) options = {}
        if (options.max && (typeof options.max !== 'number' || options.max < 0))
          throw new TypeError('max must be a non-negative number')
        const max = (this[MAX] = options.max || Infinity)
        const lc = options.length || naiveLength
        this[LENGTH_CALCULATOR] = typeof lc !== 'function' ? naiveLength : lc
        this[ALLOW_STALE] = options.stale || false
        if (options.maxAge && typeof options.maxAge !== 'number') throw new TypeError('maxAge must be a number')
        this[MAX_AGE] = options.maxAge || 0
        this[DISPOSE] = options.dispose
        this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false
        this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false
        this.reset()
      }
      set max(mL) {
        if (typeof mL !== 'number' || mL < 0) throw new TypeError('max must be a non-negative number')
        this[MAX] = mL || Infinity
        trim(this)
      }
      get max() {
        return this[MAX]
      }
      set allowStale(allowStale) {
        this[ALLOW_STALE] = !!allowStale
      }
      get allowStale() {
        return this[ALLOW_STALE]
      }
      set maxAge(mA) {
        if (typeof mA !== 'number') throw new TypeError('maxAge must be a non-negative number')
        this[MAX_AGE] = mA
        trim(this)
      }
      get maxAge() {
        return this[MAX_AGE]
      }
      set lengthCalculator(lC) {
        if (typeof lC !== 'function') lC = naiveLength
        if (lC !== this[LENGTH_CALCULATOR]) {
          this[LENGTH_CALCULATOR] = lC
          this[LENGTH] = 0
          this[LRU_LIST].forEach((hit) => {
            hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key)
            this[LENGTH] += hit.length
          })
        }
        trim(this)
      }
      get lengthCalculator() {
        return this[LENGTH_CALCULATOR]
      }
      get length() {
        return this[LENGTH]
      }
      get itemCount() {
        return this[LRU_LIST].length
      }
      rforEach(fn, thisp) {
        thisp = thisp || this
        for (let walker = this[LRU_LIST].tail; walker !== null; ) {
          const prev = walker.prev
          forEachStep(this, fn, walker, thisp)
          walker = prev
        }
      }
      forEach(fn, thisp) {
        thisp = thisp || this
        for (let walker = this[LRU_LIST].head; walker !== null; ) {
          const next = walker.next
          forEachStep(this, fn, walker, thisp)
          walker = next
        }
      }
      keys() {
        return this[LRU_LIST].toArray().map((k) => k.key)
      }
      values() {
        return this[LRU_LIST].toArray().map((k) => k.value)
      }
      reset() {
        if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
          this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value))
        }
        this[CACHE] = /* @__PURE__ */ new Map()
        this[LRU_LIST] = new Yallist()
        this[LENGTH] = 0
      }
      dump() {
        return this[LRU_LIST].map((hit) =>
          isStale(this, hit)
            ? false
            : {
                k: hit.key,
                v: hit.value,
                e: hit.now + (hit.maxAge || 0),
              },
        )
          .toArray()
          .filter((h) => h)
      }
      dumpLru() {
        return this[LRU_LIST]
      }
      set(key, value, maxAge) {
        maxAge = maxAge || this[MAX_AGE]
        if (maxAge && typeof maxAge !== 'number') throw new TypeError('maxAge must be a number')
        const now = maxAge ? Date.now() : 0
        const len = this[LENGTH_CALCULATOR](value, key)
        if (this[CACHE].has(key)) {
          if (len > this[MAX]) {
            del(this, this[CACHE].get(key))
            return false
          }
          const node = this[CACHE].get(key)
          const item = node.value
          if (this[DISPOSE]) {
            if (!this[NO_DISPOSE_ON_SET]) this[DISPOSE](key, item.value)
          }
          item.now = now
          item.maxAge = maxAge
          item.value = value
          this[LENGTH] += len - item.length
          item.length = len
          this.get(key)
          trim(this)
          return true
        }
        const hit = new Entry(key, value, len, now, maxAge)
        if (hit.length > this[MAX]) {
          if (this[DISPOSE]) this[DISPOSE](key, value)
          return false
        }
        this[LENGTH] += hit.length
        this[LRU_LIST].unshift(hit)
        this[CACHE].set(key, this[LRU_LIST].head)
        trim(this)
        return true
      }
      has(key) {
        if (!this[CACHE].has(key)) return false
        const hit = this[CACHE].get(key).value
        return !isStale(this, hit)
      }
      get(key) {
        return get(this, key, true)
      }
      peek(key) {
        return get(this, key, false)
      }
      pop() {
        const node = this[LRU_LIST].tail
        if (!node) return null
        del(this, node)
        return node.value
      }
      del(key) {
        del(this, this[CACHE].get(key))
      }
      load(arr) {
        this.reset()
        const now = Date.now()
        for (let l = arr.length - 1; l >= 0; l--) {
          const hit = arr[l]
          const expiresAt = hit.e || 0
          if (expiresAt === 0) this.set(hit.k, hit.v)
          else {
            const maxAge = expiresAt - now
            if (maxAge > 0) {
              this.set(hit.k, hit.v, maxAge)
            }
          }
        }
      }
      prune() {
        this[CACHE].forEach((value, key) => get(this, key, false))
      }
    }
    var get = (self2, key, doUse) => {
      const node = self2[CACHE].get(key)
      if (node) {
        const hit = node.value
        if (isStale(self2, hit)) {
          del(self2, node)
          if (!self2[ALLOW_STALE]) return void 0
        } else {
          if (doUse) {
            if (self2[UPDATE_AGE_ON_GET]) node.value.now = Date.now()
            self2[LRU_LIST].unshiftNode(node)
          }
        }
        return hit.value
      }
    }
    var isStale = (self2, hit) => {
      if (!hit || (!hit.maxAge && !self2[MAX_AGE])) return false
      const diff = Date.now() - hit.now
      return hit.maxAge ? diff > hit.maxAge : self2[MAX_AGE] && diff > self2[MAX_AGE]
    }
    var trim = (self2) => {
      if (self2[LENGTH] > self2[MAX]) {
        for (let walker = self2[LRU_LIST].tail; self2[LENGTH] > self2[MAX] && walker !== null; ) {
          const prev = walker.prev
          del(self2, walker)
          walker = prev
        }
      }
    }
    var del = (self2, node) => {
      if (node) {
        const hit = node.value
        if (self2[DISPOSE]) self2[DISPOSE](hit.key, hit.value)
        self2[LENGTH] -= hit.length
        self2[CACHE].delete(hit.key)
        self2[LRU_LIST].removeNode(node)
      }
    }
    var Entry = class {
      constructor(key, value, length, now, maxAge) {
        this.key = key
        this.value = value
        this.length = length
        this.now = now
        this.maxAge = maxAge || 0
      }
    }
    var forEachStep = (self2, fn, node, thisp) => {
      let hit = node.value
      if (isStale(self2, hit)) {
        del(self2, node)
        if (!self2[ALLOW_STALE]) hit = void 0
      }
      if (hit) fn.call(thisp, hit.value, hit.key, self2)
    }
    module.exports = LRUCache
  },
})

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  'node_modules/semver/classes/range.js'(exports, module) {
    init_define_process()
    var Range = class {
      constructor(range, options) {
        options = parseOptions(options)
        if (range instanceof Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range
          } else {
            return new Range(range.raw, options)
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value
          this.set = [[range]]
          this.format()
          return this
        }
        this.options = options
        this.loose = !!options.loose
        this.includePrerelease = !!options.includePrerelease
        this.raw = range
        this.set = range
          .split(/\s*\|\|\s*/)
          .map((range2) => this.parseRange(range2.trim()))
          .filter((c) => c.length)
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${range}`)
        }
        if (this.set.length > 1) {
          const first = this.set[0]
          this.set = this.set.filter((c) => !isNullSet(c[0]))
          if (this.set.length === 0) this.set = [first]
          else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c]
                break
              }
            }
          }
        }
        this.format()
      }
      format() {
        this.range = this.set
          .map((comps) => {
            return comps.join(' ').trim()
          })
          .join('||')
          .trim()
        return this.range
      }
      toString() {
        return this.range
      }
      parseRange(range) {
        range = range.trim()
        const memoOpts = Object.keys(this.options).join(',')
        const memoKey = `parseRange:${memoOpts}:${range}`
        const cached = cache.get(memoKey)
        if (cached) return cached
        const loose = this.options.loose
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE]
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease))
        debug('hyphen replace', range)
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace)
        debug('comparator trim', range, re[t.COMPARATORTRIM])
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace)
        range = range.replace(re[t.CARETTRIM], caretTrimReplace)
        range = range.split(/\s+/).join(' ')
        const compRe = loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]
        const rangeList = range
          .split(' ')
          .map((comp) => parseComparator(comp, this.options))
          .join(' ')
          .split(/\s+/)
          .map((comp) => replaceGTE0(comp, this.options))
          .filter(this.options.loose ? (comp) => !!comp.match(compRe) : () => true)
          .map((comp) => new Comparator(comp, this.options))
        const l = rangeList.length
        const rangeMap = /* @__PURE__ */ new Map()
        for (const comp of rangeList) {
          if (isNullSet(comp)) return [comp]
          rangeMap.set(comp.value, comp)
        }
        if (rangeMap.size > 1 && rangeMap.has('')) rangeMap.delete('')
        const result = [...rangeMap.values()]
        cache.set(memoKey, result)
        return result
      }
      intersects(range, options) {
        if (!(range instanceof Range)) {
          throw new TypeError('a Range is required')
        }
        return this.set.some((thisComparators) => {
          return (
            isSatisfiable(thisComparators, options) &&
            range.set.some((rangeComparators) => {
              return (
                isSatisfiable(rangeComparators, options) &&
                thisComparators.every((thisComparator) => {
                  return rangeComparators.every((rangeComparator) => {
                    return thisComparator.intersects(rangeComparator, options)
                  })
                })
              )
            })
          )
        })
      }
      test(version) {
        if (!version) {
          return false
        }
        if (typeof version === 'string') {
          try {
            version = new SemVer(version, this.options)
          } catch (er) {
            return false
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true
          }
        }
        return false
      }
    }
    module.exports = Range
    var LRU = require_lru_cache()
    var cache = new LRU({ max: 1e3 })
    var parseOptions = require_parse_options()
    var Comparator = require_comparator()
    var debug = require_debug()
    var SemVer = require_semver()
    var { re, t, comparatorTrimReplace, tildeTrimReplace, caretTrimReplace } = require_re()
    var isNullSet = (c) => c.value === '<0.0.0-0'
    var isAny = (c) => c.value === ''
    var isSatisfiable = (comparators, options) => {
      let result = true
      const remainingComparators = comparators.slice()
      let testComparator = remainingComparators.pop()
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options)
        })
        testComparator = remainingComparators.pop()
      }
      return result
    }
    var parseComparator = (comp, options) => {
      debug('comp', comp, options)
      comp = replaceCarets(comp, options)
      debug('caret', comp)
      comp = replaceTildes(comp, options)
      debug('tildes', comp)
      comp = replaceXRanges(comp, options)
      debug('xrange', comp)
      comp = replaceStars(comp, options)
      debug('stars', comp)
      return comp
    }
    var isX = (id) => !id || id.toLowerCase() === 'x' || id === '*'
    var replaceTildes = (comp, options) =>
      comp
        .trim()
        .split(/\s+/)
        .map((comp2) => {
          return replaceTilde(comp2, options)
        })
        .join(' ')
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE]
      return comp.replace(r, (_, M, m, p, pr) => {
        debug('tilde', comp, _, M, m, p, pr)
        let ret
        if (isX(M)) {
          ret = ''
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`
        } else if (pr) {
          debug('replaceTilde pr', pr)
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`
        }
        debug('tilde return', ret)
        return ret
      })
    }
    var replaceCarets = (comp, options) =>
      comp
        .trim()
        .split(/\s+/)
        .map((comp2) => {
          return replaceCaret(comp2, options)
        })
        .join(' ')
    var replaceCaret = (comp, options) => {
      debug('caret', comp, options)
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET]
      const z = options.includePrerelease ? '-0' : ''
      return comp.replace(r, (_, M, m, p, pr) => {
        debug('caret', comp, _, M, m, p, pr)
        let ret
        if (isX(M)) {
          ret = ''
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`
        } else if (isX(p)) {
          if (M === '0') {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`
          }
        } else if (pr) {
          debug('replaceCaret pr', pr)
          if (M === '0') {
            if (m === '0') {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`
          }
        } else {
          debug('no pr')
          if (M === '0') {
            if (m === '0') {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`
          }
        }
        debug('caret return', ret)
        return ret
      })
    }
    var replaceXRanges = (comp, options) => {
      debug('replaceXRanges', comp, options)
      return comp
        .split(/\s+/)
        .map((comp2) => {
          return replaceXRange(comp2, options)
        })
        .join(' ')
    }
    var replaceXRange = (comp, options) => {
      comp = comp.trim()
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE]
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug('xRange', comp, ret, gtlt, M, m, p, pr)
        const xM = isX(M)
        const xm = xM || isX(m)
        const xp = xm || isX(p)
        const anyX = xp
        if (gtlt === '=' && anyX) {
          gtlt = ''
        }
        pr = options.includePrerelease ? '-0' : ''
        if (xM) {
          if (gtlt === '>' || gtlt === '<') {
            ret = '<0.0.0-0'
          } else {
            ret = '*'
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0
          }
          p = 0
          if (gtlt === '>') {
            gtlt = '>='
            if (xm) {
              M = +M + 1
              m = 0
              p = 0
            } else {
              m = +m + 1
              p = 0
            }
          } else if (gtlt === '<=') {
            gtlt = '<'
            if (xm) {
              M = +M + 1
            } else {
              m = +m + 1
            }
          }
          if (gtlt === '<') pr = '-0'
          ret = `${gtlt + M}.${m}.${p}${pr}`
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`
        }
        debug('xRange return', ret)
        return ret
      })
    }
    var replaceStars = (comp, options) => {
      debug('replaceStars', comp, options)
      return comp.trim().replace(re[t.STAR], '')
    }
    var replaceGTE0 = (comp, options) => {
      debug('replaceGTE0', comp, options)
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
    }
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => {
      if (isX(fM)) {
        from = ''
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? '-0' : ''}`
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`
      } else if (fpr) {
        from = `>=${from}`
      } else {
        from = `>=${from}${incPr ? '-0' : ''}`
      }
      if (isX(tM)) {
        to = ''
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`
      } else {
        to = `<=${to}`
      }
      return `${from} ${to}`.trim()
    }
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver)
          if (set[i].semver === Comparator.ANY) {
            continue
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true
            }
          }
        }
        return false
      }
      return true
    }
  },
})

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  'node_modules/semver/classes/comparator.js'(exports, module) {
    init_define_process()
    var ANY = Symbol('SemVer ANY')
    var Comparator = class {
      static get ANY() {
        return ANY
      }
      constructor(comp, options) {
        options = parseOptions(options)
        if (comp instanceof Comparator) {
          if (comp.loose === !!options.loose) {
            return comp
          } else {
            comp = comp.value
          }
        }
        debug('comparator', comp, options)
        this.options = options
        this.loose = !!options.loose
        this.parse(comp)
        if (this.semver === ANY) {
          this.value = ''
        } else {
          this.value = this.operator + this.semver.version
        }
        debug('comp', this)
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]
        const m = comp.match(r)
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`)
        }
        this.operator = m[1] !== void 0 ? m[1] : ''
        if (this.operator === '=') {
          this.operator = ''
        }
        if (!m[2]) {
          this.semver = ANY
        } else {
          this.semver = new SemVer(m[2], this.options.loose)
        }
      }
      toString() {
        return this.value
      }
      test(version) {
        debug('Comparator.test', version, this.options.loose)
        if (this.semver === ANY || version === ANY) {
          return true
        }
        if (typeof version === 'string') {
          try {
            version = new SemVer(version, this.options)
          } catch (er) {
            return false
          }
        }
        return cmp(version, this.operator, this.semver, this.options)
      }
      intersects(comp, options) {
        if (!(comp instanceof Comparator)) {
          throw new TypeError('a Comparator is required')
        }
        if (!options || typeof options !== 'object') {
          options = {
            loose: !!options,
            includePrerelease: false,
          }
        }
        if (this.operator === '') {
          if (this.value === '') {
            return true
          }
          return new Range(comp.value, options).test(this.value)
        } else if (comp.operator === '') {
          if (comp.value === '') {
            return true
          }
          return new Range(this.value, options).test(comp.semver)
        }
        const sameDirectionIncreasing =
          (this.operator === '>=' || this.operator === '>') && (comp.operator === '>=' || comp.operator === '>')
        const sameDirectionDecreasing =
          (this.operator === '<=' || this.operator === '<') && (comp.operator === '<=' || comp.operator === '<')
        const sameSemVer = this.semver.version === comp.semver.version
        const differentDirectionsInclusive =
          (this.operator === '>=' || this.operator === '<=') && (comp.operator === '>=' || comp.operator === '<=')
        const oppositeDirectionsLessThan =
          cmp(this.semver, '<', comp.semver, options) &&
          (this.operator === '>=' || this.operator === '>') &&
          (comp.operator === '<=' || comp.operator === '<')
        const oppositeDirectionsGreaterThan =
          cmp(this.semver, '>', comp.semver, options) &&
          (this.operator === '<=' || this.operator === '<') &&
          (comp.operator === '>=' || comp.operator === '>')
        return (
          sameDirectionIncreasing ||
          sameDirectionDecreasing ||
          (sameSemVer && differentDirectionsInclusive) ||
          oppositeDirectionsLessThan ||
          oppositeDirectionsGreaterThan
        )
      }
    }
    module.exports = Comparator
    var parseOptions = require_parse_options()
    var { re, t } = require_re()
    var cmp = require_cmp()
    var debug = require_debug()
    var SemVer = require_semver()
    var Range = require_range()
  },
})

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  'node_modules/semver/functions/satisfies.js'(exports, module) {
    init_define_process()
    var Range = require_range()
    var satisfies = (version, range, options) => {
      try {
        range = new Range(range, options)
      } catch (er) {
        return false
      }
      return range.test(version)
    }
    module.exports = satisfies
  },
})

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  'node_modules/semver/ranges/to-comparators.js'(exports, module) {
    init_define_process()
    var Range = require_range()
    var toComparators = (range, options) =>
      new Range(range, options).set.map((comp) =>
        comp
          .map((c) => c.value)
          .join(' ')
          .trim()
          .split(' '),
      )
    module.exports = toComparators
  },
})

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  'node_modules/semver/ranges/max-satisfying.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var Range = require_range()
    var maxSatisfying = (versions, range, options) => {
      let max = null
      let maxSV = null
      let rangeObj = null
      try {
        rangeObj = new Range(range, options)
      } catch (er) {
        return null
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v
            maxSV = new SemVer(max, options)
          }
        }
      })
      return max
    }
    module.exports = maxSatisfying
  },
})

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  'node_modules/semver/ranges/min-satisfying.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var Range = require_range()
    var minSatisfying = (versions, range, options) => {
      let min = null
      let minSV = null
      let rangeObj = null
      try {
        rangeObj = new Range(range, options)
      } catch (er) {
        return null
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v
            minSV = new SemVer(min, options)
          }
        }
      })
      return min
    }
    module.exports = minSatisfying
  },
})

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  'node_modules/semver/ranges/min-version.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var Range = require_range()
    var gt = require_gt()
    var minVersion = (range, loose) => {
      range = new Range(range, loose)
      let minver = new SemVer('0.0.0')
      if (range.test(minver)) {
        return minver
      }
      minver = new SemVer('0.0.0-0')
      if (range.test(minver)) {
        return minver
      }
      minver = null
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i]
        let setMin = null
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version)
          switch (comparator.operator) {
            case '>':
              if (compver.prerelease.length === 0) {
                compver.patch++
              } else {
                compver.prerelease.push(0)
              }
              compver.raw = compver.format()
            case '':
            case '>=':
              if (!setMin || gt(compver, setMin)) {
                setMin = compver
              }
              break
            case '<':
            case '<=':
              break
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`)
          }
        })
        if (setMin && (!minver || gt(minver, setMin))) minver = setMin
      }
      if (minver && range.test(minver)) {
        return minver
      }
      return null
    }
    module.exports = minVersion
  },
})

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  'node_modules/semver/ranges/valid.js'(exports, module) {
    init_define_process()
    var Range = require_range()
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || '*'
      } catch (er) {
        return null
      }
    }
    module.exports = validRange
  },
})

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  'node_modules/semver/ranges/outside.js'(exports, module) {
    init_define_process()
    var SemVer = require_semver()
    var Comparator = require_comparator()
    var { ANY } = Comparator
    var Range = require_range()
    var satisfies = require_satisfies()
    var gt = require_gt()
    var lt = require_lt()
    var lte = require_lte()
    var gte = require_gte()
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options)
      range = new Range(range, options)
      let gtfn, ltefn, ltfn, comp, ecomp
      switch (hilo) {
        case '>':
          gtfn = gt
          ltefn = lte
          ltfn = lt
          comp = '>'
          ecomp = '>='
          break
        case '<':
          gtfn = lt
          ltefn = gte
          ltfn = gt
          comp = '<'
          ecomp = '<='
          break
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"')
      }
      if (satisfies(version, range, options)) {
        return false
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i]
        let high = null
        let low = null
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator('>=0.0.0')
          }
          high = high || comparator
          low = low || comparator
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator
          }
        })
        if (high.operator === comp || high.operator === ecomp) {
          return false
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false
        }
      }
      return true
    }
    module.exports = outside
  },
})

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  'node_modules/semver/ranges/gtr.js'(exports, module) {
    init_define_process()
    var outside = require_outside()
    var gtr = (version, range, options) => outside(version, range, '>', options)
    module.exports = gtr
  },
})

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  'node_modules/semver/ranges/ltr.js'(exports, module) {
    init_define_process()
    var outside = require_outside()
    var ltr = (version, range, options) => outside(version, range, '<', options)
    module.exports = ltr
  },
})

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  'node_modules/semver/ranges/intersects.js'(exports, module) {
    init_define_process()
    var Range = require_range()
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options)
      r2 = new Range(r2, options)
      return r1.intersects(r2)
    }
    module.exports = intersects
  },
})

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  'node_modules/semver/ranges/simplify.js'(exports, module) {
    init_define_process()
    var satisfies = require_satisfies()
    var compare = require_compare()
    module.exports = (versions, range, options) => {
      const set = []
      let min = null
      let prev = null
      const v = versions.sort((a, b) => compare(a, b, options))
      for (const version of v) {
        const included = satisfies(version, range, options)
        if (included) {
          prev = version
          if (!min) min = version
        } else {
          if (prev) {
            set.push([min, prev])
          }
          prev = null
          min = null
        }
      }
      if (min) set.push([min, null])
      const ranges = []
      for (const [min2, max] of set) {
        if (min2 === max) ranges.push(min2)
        else if (!max && min2 === v[0]) ranges.push('*')
        else if (!max) ranges.push(`>=${min2}`)
        else if (min2 === v[0]) ranges.push(`<=${max}`)
        else ranges.push(`${min2} - ${max}`)
      }
      const simplified = ranges.join(' || ')
      const original = typeof range.raw === 'string' ? range.raw : String(range)
      return simplified.length < original.length ? simplified : range
    }
  },
})

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  'node_modules/semver/ranges/subset.js'(exports, module) {
    init_define_process()
    var Range = require_range()
    var Comparator = require_comparator()
    var { ANY } = Comparator
    var satisfies = require_satisfies()
    var compare = require_compare()
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) return true
      sub = new Range(sub, options)
      dom = new Range(dom, options)
      let sawNonNull = false
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options)
          sawNonNull = sawNonNull || isSub !== null
          if (isSub) continue OUTER
        }
        if (sawNonNull) return false
      }
      return true
    }
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) return true
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) return true
        else if (options.includePrerelease) sub = [new Comparator('>=0.0.0-0')]
        else sub = [new Comparator('>=0.0.0')]
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) return true
        else dom = [new Comparator('>=0.0.0')]
      }
      const eqSet = /* @__PURE__ */ new Set()
      let gt, lt
      for (const c of sub) {
        if (c.operator === '>' || c.operator === '>=') gt = higherGT(gt, c, options)
        else if (c.operator === '<' || c.operator === '<=') lt = lowerLT(lt, c, options)
        else eqSet.add(c.semver)
      }
      if (eqSet.size > 1) return null
      let gtltComp
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options)
        if (gtltComp > 0) return null
        else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) return null
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) return null
        if (lt && !satisfies(eq, String(lt), options)) return null
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) return false
        }
        return true
      }
      let higher, lower
      let hasDomLT, hasDomGT
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false
      if (
        needDomLTPre &&
        needDomLTPre.prerelease.length === 1 &&
        lt.operator === '<' &&
        needDomLTPre.prerelease[0] === 0
      ) {
        needDomLTPre = false
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>='
        hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<='
        if (gt) {
          if (needDomGTPre) {
            if (
              c.semver.prerelease &&
              c.semver.prerelease.length &&
              c.semver.major === needDomGTPre.major &&
              c.semver.minor === needDomGTPre.minor &&
              c.semver.patch === needDomGTPre.patch
            ) {
              needDomGTPre = false
            }
          }
          if (c.operator === '>' || c.operator === '>=') {
            higher = higherGT(gt, c, options)
            if (higher === c && higher !== gt) return false
          } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options)) return false
        }
        if (lt) {
          if (needDomLTPre) {
            if (
              c.semver.prerelease &&
              c.semver.prerelease.length &&
              c.semver.major === needDomLTPre.major &&
              c.semver.minor === needDomLTPre.minor &&
              c.semver.patch === needDomLTPre.patch
            ) {
              needDomLTPre = false
            }
          }
          if (c.operator === '<' || c.operator === '<=') {
            lower = lowerLT(lt, c, options)
            if (lower === c && lower !== lt) return false
          } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options)) return false
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) return false
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) return false
      if (lt && hasDomGT && !gt && gtltComp !== 0) return false
      if (needDomGTPre || needDomLTPre) return false
      return true
    }
    var higherGT = (a, b, options) => {
      if (!a) return b
      const comp = compare(a.semver, b.semver, options)
      return comp > 0 ? a : comp < 0 ? b : b.operator === '>' && a.operator === '>=' ? b : a
    }
    var lowerLT = (a, b, options) => {
      if (!a) return b
      const comp = compare(a.semver, b.semver, options)
      return comp < 0 ? a : comp > 0 ? b : b.operator === '<' && a.operator === '<=' ? b : a
    }
    module.exports = subset
  },
})

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  'node_modules/semver/index.js'(exports, module) {
    init_define_process()
    var internalRe = require_re()
    module.exports = {
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: require_constants().SEMVER_SPEC_VERSION,
      SemVer: require_semver(),
      compareIdentifiers: require_identifiers().compareIdentifiers,
      rcompareIdentifiers: require_identifiers().rcompareIdentifiers,
      parse: require_parse2(),
      valid: require_valid(),
      clean: require_clean(),
      inc: require_inc(),
      diff: require_diff(),
      major: require_major(),
      minor: require_minor(),
      patch: require_patch(),
      prerelease: require_prerelease(),
      compare: require_compare(),
      rcompare: require_rcompare(),
      compareLoose: require_compare_loose(),
      compareBuild: require_compare_build(),
      sort: require_sort(),
      rsort: require_rsort(),
      gt: require_gt(),
      lt: require_lt(),
      eq: require_eq2(),
      neq: require_neq(),
      gte: require_gte(),
      lte: require_lte(),
      cmp: require_cmp(),
      coerce: require_coerce(),
      Comparator: require_comparator(),
      Range: require_range(),
      satisfies: require_satisfies(),
      toComparators: require_to_comparators(),
      maxSatisfying: require_max_satisfying(),
      minSatisfying: require_min_satisfying(),
      minVersion: require_min_version(),
      validRange: require_valid2(),
      outside: require_outside(),
      gtr: require_gtr(),
      ltr: require_ltr(),
      intersects: require_intersects(),
      simplifyRange: require_simplify(),
      subset: require_subset(),
    }
  },
})

// node_modules/lodash/_baseProperty.js
var require_baseProperty = __commonJS({
  'node_modules/lodash/_baseProperty.js'(exports, module) {
    init_define_process()
    function baseProperty(key) {
      return function (object) {
        return object == null ? void 0 : object[key]
      }
    }
    module.exports = baseProperty
  },
})

// node_modules/lodash/unzip.js
var require_unzip = __commonJS({
  'node_modules/lodash/unzip.js'(exports, module) {
    init_define_process()
    var arrayFilter = require_arrayFilter()
    var arrayMap = require_arrayMap()
    var baseProperty = require_baseProperty()
    var baseTimes = require_baseTimes()
    var isArrayLikeObject = require_isArrayLikeObject()
    var nativeMax = Math.max
    function unzip(array) {
      if (!(array && array.length)) {
        return []
      }
      var length = 0
      array = arrayFilter(array, function (group) {
        if (isArrayLikeObject(group)) {
          length = nativeMax(group.length, length)
          return true
        }
      })
      return baseTimes(length, function (index) {
        return arrayMap(array, baseProperty(index))
      })
    }
    module.exports = unzip
  },
})

// node_modules/lodash/zip.js
var require_zip = __commonJS({
  'node_modules/lodash/zip.js'(exports, module) {
    init_define_process()
    var baseRest = require_baseRest()
    var unzip = require_unzip()
    var zip = baseRest(unzip)
    module.exports = zip
  },
})

// validator/schema/types.js
var require_types5 = __commonJS({
  'validator/schema/types.js'(exports, module) {
    init_define_process()
    var pluralize = require_pluralize()
    pluralize.addUncountableRule('hertz')
    var { Memoizer } = require_types2()
    var SchemaAttributes = class {
      constructor(schemaParser) {
        this.tags = schemaParser.tags
        this.tagAttributes = schemaParser.tagAttributes
        this.tagUnitClasses = schemaParser.tagUnitClasses
        this.unitClasses = schemaParser.unitClasses
        this.unitClassAttributes = schemaParser.unitClassAttributes
        this.unitAttributes = schemaParser.unitAttributes
        this.unitModifiers = schemaParser.unitModifiers
        this.hasUnitClasses = schemaParser.hasUnitClasses
        this.hasUnitModifiers = schemaParser.hasUnitModifiers
      }
      tagHasAttribute(tag, tagAttribute) {
        if (!(tagAttribute in this.tagAttributes)) {
          return null
        }
        return tag.toLowerCase() in this.tagAttributes[tagAttribute]
      }
    }
    var SchemaEntries = class extends Memoizer {
      constructor(schemaParser) {
        super()
        this.properties = new SchemaEntryManager(schemaParser.properties)
        this.attributes = new SchemaEntryManager(schemaParser.attributes)
        this.definitions = schemaParser.definitions
      }
      get unitClassMap() {
        return this.definitions.get('unitClasses').definitions
      }
      get allUnits() {
        return this._memoize('allUnits', () => {
          const units = []
          for (const unitClass of this.unitClassMap.values()) {
            const unitClassUnits = unitClass.units
            units.push(...unitClassUnits)
          }
          return new Map(units)
        })
      }
      get SIUnitModifiers() {
        const unitModifiers = this.definitions.get('unitModifiers')
        return unitModifiers.getEntriesWithBooleanAttribute('SIUnitModifier')
      }
      get SIUnitSymbolModifiers() {
        const unitModifiers = this.definitions.get('unitModifiers')
        return unitModifiers.getEntriesWithBooleanAttribute('SIUnitSymbolModifier')
      }
      tagHasAttribute(tag, tagAttribute) {
        if (!this.definitions.get('tags').hasEntry(tag)) {
          return false
        }
        return this.definitions.get('tags').getEntry(tag).hasAttributeName(tagAttribute)
      }
    }
    var SchemaEntryManager = class extends Memoizer {
      constructor(definitions) {
        super()
        this.definitions = definitions
      }
      [Symbol.iterator]() {
        return this.definitions.entries()
      }
      hasEntry(name) {
        return this.definitions.has(name)
      }
      getEntry(name) {
        return this.definitions.get(name)
      }
      getEntriesWithBooleanAttribute(booleanPropertyName) {
        return this._memoize(booleanPropertyName, () => {
          return this.filter(([_, v]) => {
            return v.hasAttributeName(booleanPropertyName)
          })
        })
      }
      filter(fn) {
        const pairArray = Array.from(this.definitions.entries())
        return new Map(pairArray.filter((entry) => fn(entry)))
      }
    }
    var SchemaEntry = class {
      constructor(name, booleanAttributes, valueAttributes) {
        this._name = name
        this._booleanAttributes = booleanAttributes
        this._valueAttributes = valueAttributes
        this._booleanAttributeNames = /* @__PURE__ */ new Set()
        for (const attribute of booleanAttributes) {
          this._booleanAttributeNames.add(attribute.name)
        }
        this._valueAttributeNames = /* @__PURE__ */ new Map()
        for (const [attributeName, value] of valueAttributes) {
          this._valueAttributeNames.set(attributeName.name, value)
        }
      }
      get name() {
        return this._name
      }
      hasAttribute(attribute) {
        return this._booleanAttributes.has(attribute)
      }
      getAttributeValue(attribute, alwaysReturnArray = false) {
        return SchemaEntry._getMapArrayValue(this._valueAttributes, attribute, alwaysReturnArray)
      }
      hasAttributeName(attributeName) {
        return this._booleanAttributeNames.has(attributeName)
      }
      getNamedAttributeValue(attributeName, alwaysReturnArray = false) {
        return SchemaEntry._getMapArrayValue(this._valueAttributeNames, attributeName, alwaysReturnArray)
      }
      static _getMapArrayValue(map, key, alwaysReturnArray) {
        const value = map.get(key)
        if (!alwaysReturnArray && Array.isArray(value) && value.length === 1) {
          return value[0]
        } else {
          return value
        }
      }
    }
    var categoryProperty = 'categoryProperty'
    var typeProperty = 'typeProperty'
    var SchemaProperty = class extends SchemaEntry {
      constructor(name, propertyType) {
        super(name, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Map())
        this._propertyType = propertyType
      }
      get isCategoryProperty() {
        return this._propertyType === categoryProperty
      }
      get isTypeProperty() {
        return this._propertyType === typeProperty
      }
    }
    var nodeProperty = new SchemaProperty('nodeProperty', categoryProperty)
    var attributeProperty = new SchemaProperty('attributeProperty', categoryProperty)
    var stringProperty = new SchemaProperty('stringProperty', typeProperty)
    var SchemaAttribute = class extends SchemaEntry {
      constructor(name, properties) {
        super(name, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Map())
        const categoryProperties = properties.filter((property) => property.isCategoryProperty)
        this._categoryProperty = categoryProperties.length === 0 ? nodeProperty : categoryProperties[0]
        const typeProperties = properties.filter((property) => property.isTypeProperty)
        this._typeProperty = typeProperties.length === 0 ? stringProperty : typeProperties[0]
      }
      get categoryProperty() {
        return this._categoryProperty
      }
      get typeProperty() {
        return this._typeProperty
      }
    }
    var SchemaUnit = class extends SchemaEntry {
      constructor(name, booleanAttributes, valueAttributes, unitModifiers) {
        super(name, booleanAttributes, valueAttributes)
        this._derivativeUnits = [name]
        if (!this.isSIUnit) {
          return
        }
        const matchingModifiers = unitModifiers.filter(([_, unitModifier]) => {
          return this.isUnitSymbol === unitModifier.isSIUnitSymbolModifier
        })
        for (const modifierName of matchingModifiers.keys()) {
          this._derivativeUnits.push(modifierName + name)
        }
        if (!this.isUnitSymbol) {
          const pluralUnit = pluralize.plural(name)
          this._derivativeUnits.push(pluralUnit)
          const SIUnitModifiers = unitModifiers.getEntriesWithBooleanAttribute('SIUnitModifier')
          for (const modifierName of SIUnitModifiers.keys()) {
            this._derivativeUnits.push(modifierName + pluralUnit)
          }
        }
      }
      *derivativeUnits() {
        for (const unit of this._derivativeUnits) {
          yield unit
        }
      }
      get isPrefixUnit() {
        return this.hasAttributeName('unitPrefix')
      }
      get isSIUnit() {
        return this.hasAttributeName('SIUnit')
      }
      get isUnitSymbol() {
        return this.hasAttributeName('unitSymbol')
      }
    }
    var SchemaUnitClass = class extends SchemaEntry {
      constructor(name, booleanAttributes, valueAttributes, units) {
        super(name, booleanAttributes, valueAttributes)
        this._units = units
      }
      get units() {
        return this._units
      }
      get defaultUnit() {
        return this._units.get(this.getNamedAttributeValue('defaultUnits'))
      }
    }
    var SchemaUnitModifier = class extends SchemaEntry {
      constructor(name, booleanAttributes, valueAttributes) {
        super(name, booleanAttributes, valueAttributes)
      }
      get isSIUnitModifier() {
        return this.hasAttributeName('SIUnitModifier')
      }
      get isSIUnitSymbolModifier() {
        return this.hasAttributeName('SIUnitSymbolModifier')
      }
    }
    var SchemaValueClass = class extends SchemaEntry {
      constructor(name, booleanAttributes, valueAttributes) {
        super(name, booleanAttributes, valueAttributes)
      }
    }
    var SchemaTag = class extends SchemaEntry {
      constructor(name, booleanAttributes, valueAttributes, unitClasses) {
        super(name, booleanAttributes, valueAttributes)
        this._unitClasses = unitClasses || []
      }
      get unitClasses() {
        return this._unitClasses
      }
      get hasUnitClasses() {
        return this._unitClasses.length !== 0
      }
    }
    module.exports = {
      nodeProperty,
      attributeProperty,
      SchemaAttributes,
      SchemaEntries,
      SchemaEntryManager,
      SchemaProperty,
      SchemaAttribute,
      SchemaTag,
      SchemaUnit,
      SchemaUnitClass,
      SchemaUnitModifier,
      SchemaValueClass,
    }
  },
})

// validator/schema/parser.js
var require_parser2 = __commonJS({
  'validator/schema/parser.js'(exports, module) {
    init_define_process()
    var flattenDeep = require_flattenDeep()
    var xpath = require_xpath()
    var SchemaParser = class {
      constructor(rootElement) {
        this.rootElement = rootElement
      }
      populateDictionaries() {
        this.populateUnitClassDictionaries()
        this.populateUnitModifierDictionaries()
        this.populateTagDictionaries()
      }
      populateTagDictionaries() {}
      populateUnitClassDictionaries() {}
      populateUnitModifierDictionaries() {}
      getAllChildTags(parentElement, elementName = 'node', excludeTakeValueTags = true) {
        if (excludeTakeValueTags && this.getElementTagName(parentElement) === '#') {
          return []
        }
        const tagElementChildren = this.getElementsByName(elementName, parentElement)
        const childTags = flattenDeep(
          tagElementChildren.map((child) => this.getAllChildTags(child, elementName, excludeTakeValueTags)),
        )
        childTags.push(parentElement)
        return childTags
      }
      getElementsByName(elementName = 'node', parentElement = this.rootElement) {
        return xpath.find(parentElement, '//' + elementName)
      }
      getTagPathFromTagElement(tagElement) {
        const ancestorTagNames = this.getAncestorTagNames(tagElement)
        ancestorTagNames.unshift(this.getElementTagName(tagElement))
        ancestorTagNames.reverse()
        return ancestorTagNames.join('/')
      }
      getAncestorTagNames(tagElement) {
        const ancestorTags = []
        let parentTagName = this.getParentTagName(tagElement)
        let parentElement = tagElement.$parent
        while (parentTagName) {
          ancestorTags.push(parentTagName)
          parentTagName = this.getParentTagName(parentElement)
          parentElement = parentElement.$parent
        }
        return ancestorTags
      }
      getParentTagName(tagElement) {
        const parentTagElement = tagElement.$parent
        if (parentTagElement && parentTagElement.$parent) {
          return this.getElementTagName(parentTagElement)
        } else {
          return ''
        }
      }
      getElementTagName(element) {
        return element.name[0]._
      }
      getElementTagValue(element, tagName) {
        return element[tagName][0]._
      }
      stringListToLowercaseTrueDictionary(stringList) {
        const lowercaseDictionary = {}
        for (const stringElement of stringList) {
          lowercaseDictionary[stringElement.toLowerCase()] = true
        }
        return lowercaseDictionary
      }
    }
    module.exports = {
      SchemaParser,
    }
  },
})

// validator/schema/hed2.js
var require_hed2 = __commonJS({
  'validator/schema/hed2.js'(exports, module) {
    init_define_process()
    var flattenDeep = require_flattenDeep()
    var xpath = require_xpath()
    var { SchemaAttributes } = require_types5()
    var defaultUnitForTagAttribute = 'default'
    var defaultUnitForUnitClassAttribute = 'defaultUnits'
    var defaultUnitForOldUnitClassAttribute = 'default'
    var extensionAllowedAttribute = 'extensionAllowed'
    var tagDictionaryKeys = [
      'default',
      'extensionAllowed',
      'isNumeric',
      'position',
      'predicateType',
      'recommended',
      'required',
      'requireChild',
      'tags',
      'takesValue',
      'unique',
      'unitClass',
    ]
    var unitClassDictionaryKeys = ['SIUnit', 'unitSymbol']
    var unitModifierDictionaryKeys = ['SIUnitModifier', 'SIUnitSymbolModifier']
    var tagsDictionaryKey = 'tags'
    var tagUnitClassAttribute = 'unitClass'
    var unitClassElement = 'unitClass'
    var unitClassUnitElement = 'unit'
    var unitClassUnitsElement = 'units'
    var unitModifierElement = 'unitModifier'
    var lc = (str) => str.toLowerCase()
    var { SchemaParser } = require_parser2()
    var Hed2SchemaParser = class extends SchemaParser {
      parse() {
        this.populateDictionaries()
        return new SchemaAttributes(this)
      }
      populateTagDictionaries() {
        this.tagAttributes = {}
        for (const dictionaryKey of tagDictionaryKeys) {
          const [tags, tagElements] = this.getTagsByAttribute(dictionaryKey)
          if (dictionaryKey === extensionAllowedAttribute) {
            const tagDictionary = this.stringListToLowercaseTrueDictionary(tags)
            const childTagElements = flattenDeep(tagElements.map((tagElement) => this.getAllChildTags(tagElement)))
            const childTags = childTagElements.map((tagElement) => {
              return this.getTagPathFromTagElement(tagElement)
            })
            const childDictionary = this.stringListToLowercaseTrueDictionary(childTags)
            this.tagAttributes[extensionAllowedAttribute] = Object.assign({}, tagDictionary, childDictionary)
          } else if (dictionaryKey === defaultUnitForTagAttribute) {
            this.populateTagToAttributeDictionary(tags, tagElements, dictionaryKey)
          } else if (dictionaryKey === tagUnitClassAttribute) {
            this.populateTagUnitClassDictionary(tags, tagElements)
          } else if (dictionaryKey === tagsDictionaryKey) {
            const tags2 = this.getAllTags()[0]
            this.tags = tags2.map(lc)
          } else {
            this.tagAttributes[dictionaryKey] = this.stringListToLowercaseTrueDictionary(tags)
          }
        }
      }
      populateUnitClassDictionaries() {
        const unitClassElements = this.getElementsByName(unitClassElement)
        if (unitClassElements.length === 0) {
          this.hasUnitClasses = false
          return
        }
        this.hasUnitClasses = true
        this.populateUnitClassUnitsDictionary(unitClassElements)
        this.populateUnitClassDefaultUnitDictionary(unitClassElements)
      }
      populateUnitClassUnitsDictionary(unitClassElements) {
        this.unitClasses = {}
        this.unitClassAttributes = {}
        this.unitAttributes = {}
        for (const unitClassKey of unitClassDictionaryKeys) {
          this.unitAttributes[unitClassKey] = {}
        }
        for (const unitClassElement2 of unitClassElements) {
          const unitClassName = this.getElementTagName(unitClassElement2)
          this.unitClassAttributes[unitClassName] = {}
          const units = unitClassElement2[unitClassUnitsElement][0][unitClassUnitElement]
          if (units === void 0) {
            const elementUnits = this.getElementTagValue(unitClassElement2, unitClassUnitsElement)
            const units2 = elementUnits.split(',')
            this.unitClasses[unitClassName] = units2.map(lc)
            continue
          }
          this.unitClasses[unitClassName] = units.map((element) => element._)
          for (const unit of units) {
            if (unit.$) {
              const unitName = unit._
              for (const unitClassKey of unitClassDictionaryKeys) {
                this.unitAttributes[unitClassKey][unitName] = unit.$[unitClassKey]
              }
            }
          }
        }
      }
      populateUnitClassDefaultUnitDictionary(unitClassElements) {
        for (const unitClassElement2 of unitClassElements) {
          const elementName = this.getElementTagName(unitClassElement2)
          const defaultUnit = unitClassElement2.$[defaultUnitForUnitClassAttribute]
          if (defaultUnit === void 0) {
            this.unitClassAttributes[elementName][defaultUnitForUnitClassAttribute] = [
              unitClassElement2.$[defaultUnitForOldUnitClassAttribute],
            ]
          } else {
            this.unitClassAttributes[elementName][defaultUnitForUnitClassAttribute] = [defaultUnit]
          }
        }
      }
      populateUnitModifierDictionaries() {
        this.unitModifiers = {}
        const unitModifierElements = this.getElementsByName(unitModifierElement)
        if (unitModifierElements.length === 0) {
          this.hasUnitModifiers = false
          return
        }
        this.hasUnitModifiers = true
        for (const unitModifierKey of unitModifierDictionaryKeys) {
          this.unitModifiers[unitModifierKey] = {}
        }
        for (const unitModifierElement2 of unitModifierElements) {
          const unitModifierName = this.getElementTagName(unitModifierElement2)
          if (unitModifierElement2.$) {
            for (const unitModifierKey of unitModifierDictionaryKeys) {
              if (unitModifierElement2.$[unitModifierKey] !== void 0) {
                this.unitModifiers[unitModifierKey][unitModifierName] = unitModifierElement2.$[unitModifierKey]
              }
            }
          }
        }
      }
      populateTagToAttributeDictionary(tagList, tagElementList, attributeName) {
        this.tagAttributes[attributeName] = {}
        for (let i = 0; i < tagList.length; i++) {
          const tag = tagList[i]
          this.tagAttributes[attributeName][tag.toLowerCase()] = tagElementList[i].$[attributeName]
        }
      }
      populateTagUnitClassDictionary(tagList, tagElementList) {
        this.tagUnitClasses = {}
        for (let i = 0; i < tagList.length; i++) {
          const tag = tagList[i]
          const unitClassString = tagElementList[i].$[tagUnitClassAttribute]
          if (unitClassString) {
            this.tagUnitClasses[tag.toLowerCase()] = unitClassString.split(',')
          }
        }
      }
      getTagsByAttribute(attributeName) {
        const tags = []
        const tagElements = xpath.find(this.rootElement, '//node[@' + attributeName + ']')
        for (const attributeTagElement of tagElements) {
          const tag = this.getTagPathFromTagElement(attributeTagElement)
          tags.push(tag)
        }
        return [tags, tagElements]
      }
      getAllTags(tagElementName = 'node', excludeTakeValueTags = true) {
        const tags = []
        const tagElements = xpath.find(this.rootElement, '//' + tagElementName)
        for (const tagElement of tagElements) {
          if (excludeTakeValueTags && this.getElementTagName(tagElement) === '#') {
            continue
          }
          const tag = this.getTagPathFromTagElement(tagElement)
          tags.push(tag)
        }
        return [tags, tagElements]
      }
    }
    module.exports = {
      Hed2SchemaParser,
    }
  },
})

// validator/schema/hed3.js
var require_hed32 = __commonJS({
  'validator/schema/hed3.js'(exports, module) {
    init_define_process()
    var xpath = require_xpath()
    var { SchemaParser } = require_parser2()
    var {
      SchemaEntries,
      SchemaEntryManager,
      SchemaAttribute,
      SchemaProperty,
      SchemaTag,
      SchemaUnit,
      SchemaUnitClass,
      SchemaUnitModifier,
      SchemaValueClass,
      nodeProperty,
      attributeProperty,
    } = require_types5()
    var lc = (str) => str.toLowerCase()
    var Hed3SchemaParser = class extends SchemaParser {
      constructor(rootElement) {
        super(rootElement)
        this._versionDefinitions = {}
      }
      parse() {
        this.populateDictionaries()
        return new SchemaEntries(this)
      }
      populateDictionaries() {
        this.parseProperties()
        this.parseAttributes()
        this.definitions = /* @__PURE__ */ new Map()
        this.parseUnitModifiers()
        this.parseUnitClasses()
        this.parseTags()
      }
      static attributeFilter(propertyName) {
        return (element) => {
          const validProperty = propertyName
          if (!element.property) {
            return false
          }
          for (const property of element.property) {
            if (property.name[0]._ === validProperty) {
              return true
            }
          }
          return false
        }
      }
      getAllTags(tagElementName = 'node') {
        const tagElements = xpath.find(this.rootElement, '//' + tagElementName)
        const tags = tagElements.map((element) => this.getTagPathFromTagElement(element))
        return [tags, tagElements]
      }
      parseProperties() {
        const propertyDefinitions = this.getElementsByName('propertyDefinition')
        this.properties = /* @__PURE__ */ new Map()
        for (const definition of propertyDefinitions) {
          const propertyName = this.getElementTagName(definition)
          if (
            this._versionDefinitions.categoryProperties &&
            this._versionDefinitions.categoryProperties.has(propertyName)
          ) {
            this.properties.set(propertyName, new SchemaProperty(propertyName, 'categoryProperty'))
          } else if (
            this._versionDefinitions.typeProperties &&
            this._versionDefinitions.typeProperties.has(propertyName)
          ) {
            this.properties.set(propertyName, new SchemaProperty(propertyName, 'typeProperty'))
          }
        }
      }
      parseAttributes() {
        const attributeDefinitions = this.getElementsByName('schemaAttributeDefinition')
        this.attributes = /* @__PURE__ */ new Map()
        for (const definition of attributeDefinitions) {
          const attributeName = this.getElementTagName(definition)
          const propertyElements = definition.property
          let properties
          if (propertyElements === void 0) {
            properties = []
          } else {
            properties = propertyElements.map((element) => this.properties.get(element.name[0]._))
          }
          this.attributes.set(attributeName, new SchemaAttribute(attributeName, properties))
        }
        if (this._addAttributes) {
          this._addAttributes()
        }
      }
      parseValueClasses() {
        const valueClasses = /* @__PURE__ */ new Map()
        const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions('valueClass')
        for (const [name, valueAttributes] of valueAttributeDefinitions) {
          const booleanAttributes = booleanAttributeDefinitions.get(name)
          valueClasses.set(name, new SchemaValueClass(name, booleanAttributes, valueAttributes))
        }
        this.definitions.set('valueClasses', new SchemaEntryManager(valueClasses))
      }
      parseUnitModifiers() {
        const unitModifiers = /* @__PURE__ */ new Map()
        const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions('unitModifier')
        for (const [name, valueAttributes] of valueAttributeDefinitions) {
          const booleanAttributes = booleanAttributeDefinitions.get(name)
          unitModifiers.set(name, new SchemaUnitModifier(name, booleanAttributes, valueAttributes))
        }
        this.definitions.set('unitModifiers', new SchemaEntryManager(unitModifiers))
      }
      parseUnitClasses() {
        const unitClasses = /* @__PURE__ */ new Map()
        const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseDefinitions('unitClass')
        const unitClassUnits = this.parseUnits()
        for (const [name, valueAttributes] of valueAttributeDefinitions) {
          const booleanAttributes = booleanAttributeDefinitions.get(name)
          unitClasses.set(name, new SchemaUnitClass(name, booleanAttributes, valueAttributes, unitClassUnits.get(name)))
        }
        this.definitions.set('unitClasses', new SchemaEntryManager(unitClasses))
      }
      parseUnits() {
        const unitClassUnits = /* @__PURE__ */ new Map()
        const unitClassElements = this.getElementsByName('unitClassDefinition')
        const unitModifiers = this.definitions.get('unitModifiers')
        for (const element of unitClassElements) {
          const elementName = this.getElementTagName(element)
          const units = /* @__PURE__ */ new Map()
          unitClassUnits.set(elementName, units)
          if (element.unit === void 0) {
            continue
          }
          const [unitBooleanAttributeDefinitions, unitValueAttributeDefinitions] = this._parseAttributeElements(
            element.unit,
            this.getElementTagName,
          )
          for (const [name, valueAttributes] of unitValueAttributeDefinitions) {
            const booleanAttributes = unitBooleanAttributeDefinitions.get(name)
            units.set(name, new SchemaUnit(name, booleanAttributes, valueAttributes, unitModifiers))
          }
        }
        return unitClassUnits
      }
      parseTags() {
        const [tags, tagElements] = this.getAllTags()
        const lowercaseTags = tags.map(lc)
        this.tags = new Set(lowercaseTags)
        const [booleanAttributeDefinitions, valueAttributeDefinitions] = this._parseAttributeElements(
          tagElements,
          (element) => this.getTagPathFromTagElement(element),
        )
        const recursiveAttributes = Array.from(this.attributes.values()).filter((attribute) =>
          attribute.hasAttributeName('recursive'),
        )
        const unitClasses = this.definitions.get('unitClasses')
        const tagUnitClassAttribute = this.attributes.get('unitClass')
        const tagUnitClassDefinitions = /* @__PURE__ */ new Map()
        const recursiveChildren = /* @__PURE__ */ new Map()
        tags.forEach((tagName, index) => {
          const tagElement = tagElements[index]
          const valueAttributes = valueAttributeDefinitions.get(tagName)
          if (valueAttributes.has(tagUnitClassAttribute)) {
            tagUnitClassDefinitions.set(
              tagName,
              valueAttributes.get(tagUnitClassAttribute).map((unitClassName) => {
                return unitClasses.getEntry(unitClassName)
              }),
            )
            valueAttributes.delete(tagUnitClassAttribute)
          }
          for (const attribute of recursiveAttributes) {
            const children2 = recursiveChildren.get(attribute) || []
            if (booleanAttributeDefinitions.get(tagName).has(attribute)) {
              children2.push(...this.getAllChildTags(tagElement))
            }
            recursiveChildren.set(attribute, children2)
          }
        })
        for (const [attribute, childTagElements] of recursiveChildren) {
          for (const tagElement of childTagElements) {
            const tagName = this.getTagPathFromTagElement(tagElement)
            booleanAttributeDefinitions.get(tagName).add(attribute)
          }
        }
        const tagEntries = /* @__PURE__ */ new Map()
        for (const [name, valueAttributes] of valueAttributeDefinitions) {
          const booleanAttributes = booleanAttributeDefinitions.get(name)
          const unitClasses2 = tagUnitClassDefinitions.get(name)
          tagEntries.set(lc(name), new SchemaTag(name, booleanAttributes, valueAttributes, unitClasses2))
        }
        for (const tagElement of tagElements) {
          const tagName = this.getTagPathFromTagElement(tagElement)
          const parentTagName = this.getParentTagName(tagElement)
          if (parentTagName) {
            tagEntries.get(lc(tagName))._parent = tagEntries.get(lc(parentTagName))
          }
        }
        this.definitions.set('tags', new SchemaEntryManager(tagEntries))
      }
      _parseDefinitions(category) {
        const categoryTagName = category + 'Definition'
        const definitionElements = this.getElementsByName(categoryTagName)
        return this._parseAttributeElements(definitionElements, this.getElementTagName)
      }
      _parseAttributeElements(elements, namer) {
        const booleanAttributeDefinitions = /* @__PURE__ */ new Map()
        const valueAttributeDefinitions = /* @__PURE__ */ new Map()
        for (const element of elements) {
          const elementName = namer(element)
          const booleanAttributes = /* @__PURE__ */ new Set()
          const valueAttributes = /* @__PURE__ */ new Map()
          booleanAttributeDefinitions.set(elementName, booleanAttributes)
          valueAttributeDefinitions.set(elementName, valueAttributes)
          if (element.attribute === void 0) {
            continue
          }
          for (const tagAttribute of element.attribute) {
            const attributeName = tagAttribute.name[0]._
            if (tagAttribute.value === void 0) {
              booleanAttributes.add(this.attributes.get(attributeName))
              continue
            }
            const values = tagAttribute.value.map((value) => value._)
            valueAttributes.set(this.attributes.get(attributeName), values)
          }
        }
        return [booleanAttributeDefinitions, valueAttributeDefinitions]
      }
    }
    var HedV8SchemaParser = class extends Hed3SchemaParser {
      constructor(rootElement) {
        super(rootElement)
        this._versionDefinitions = {
          typeProperties: /* @__PURE__ */ new Set(['boolProperty']),
          categoryProperties: /* @__PURE__ */ new Set([
            'unitProperty',
            'unitClassProperty',
            'unitModifierProperty',
            'valueClassProperty',
          ]),
        }
      }
      _addAttributes() {
        const recursiveAttribute = new SchemaAttribute('recursive', [
          this.properties.get('boolProperty'),
          attributeProperty,
        ])
        this.attributes.set('recursive', recursiveAttribute)
        const extensionAllowedAttribute = this.attributes.get('extensionAllowed')
        extensionAllowedAttribute._booleanAttributes.add(recursiveAttribute)
        extensionAllowedAttribute._booleanAttributeNames.add('recursive')
      }
    }
    module.exports = {
      Hed3SchemaParser,
      HedV8SchemaParser,
    }
  },
})

// validator/schema/init.js
var require_init2 = __commonJS({
  'validator/schema/init.js'(exports, module) {
    init_define_process()
    var zip = require_zip()
    var semver = require_semver2()
    var { Schemas, Hed2Schema, Hed3Schema, SchemasSpec } = require_types3()
    var { loadSchema } = require_loader()
    var { buildMappingObject } = require_schema2()
    var { setParent } = require_xml2js2()
    var { Hed2SchemaParser } = require_hed2()
    var { HedV8SchemaParser } = require_hed32()
    var isHed3Schema = function (xmlData) {
      return xmlData.HED.$.library !== void 0 || semver.gte(xmlData.HED.$.version, '8.0.0-alpha.3')
    }
    var buildSchemaAttributesObject = function (xmlData) {
      const rootElement = xmlData.HED
      setParent(rootElement, null)
      if (isHed3Schema(xmlData)) {
        return new HedV8SchemaParser(rootElement).parse()
      } else {
        return new Hed2SchemaParser(rootElement).parse()
      }
    }
    var buildSchemaObject = function (xmlData) {
      const schemaAttributes = buildSchemaAttributesObject(xmlData)
      const mapping = buildMappingObject(xmlData)
      if (isHed3Schema(xmlData)) {
        return new Hed3Schema(xmlData, schemaAttributes, mapping)
      } else {
        return new Hed2Schema(xmlData, schemaAttributes, mapping)
      }
    }
    var buildSchema = function (schemaDef = {}, useFallback = true) {
      return loadSchema(schemaDef, useFallback).then(([xmlData, baseSchemaIssues]) => {
        const baseSchema = buildSchemaObject(xmlData)
        if (schemaDef.libraries === void 0) {
          return new Schemas(baseSchema)
        }
        const [libraryKeys, libraryDefs] = zip(...Object.entries(schemaDef.libraries))
        return Promise.all(
          libraryDefs.map((libraryDef) => {
            return loadSchema(libraryDef, false)
          }),
        ).then((libraryXmlDataAndIssues) => {
          const [libraryXmlData, libraryXmlIssues] = zip(...libraryXmlDataAndIssues)
          const librarySchemaObjects = libraryXmlData.map(buildSchemaObject)
          const schemas = new Map(zip(libraryKeys, librarySchemaObjects))
          schemas.set('', baseSchema)
          return new Schemas(schemas)
        })
      })
    }
    var buildSchemas = function (schemaSpecs) {
      if (schemaSpecs instanceof SchemasSpec) {
        schemaSpecs = schemaSpecs.data
      }
      const schemaKeys = Array.from(schemaSpecs.keys())
      return Promise.all(
        schemaKeys.map((k) => {
          const spec = schemaSpecs.get(k)
          return loadSchema(spec, false, false)
        }),
      ).then((schemaXmlDataAndIssues) => {
        const [schemaXmlData, schemaXmlIssues] = zip(...schemaXmlDataAndIssues)
        const schemaObjects = schemaXmlData.map(buildSchemaObject)
        const schemas = new Map(zip(schemaKeys, schemaObjects))
        return [new Schemas(schemas), schemaXmlIssues.flat()]
      })
    }
    module.exports = {
      buildSchema,
      buildSchemas,
      buildSchemaAttributesObject,
    }
  },
})

// validator/bids/schema.js
var require_schema3 = __commonJS({
  'validator/bids/schema.js'(exports, module) {
    init_define_process()
    var semver = require_semver2()
    var { buildSchemas } = require_init2()
    var { generateIssue } = require_issues()
    var { SchemaSpec, SchemasSpec } = require_types3()
    var { asArray } = require_array()
    var alphanumericRegExp = new RegExp('^[a-zA-Z0-9]+$')
    function buildBidsSchemas(dataset, schemaDefinition) {
      let schemasSpec
      let issues
      if (schemaDefinition) {
        ;[schemasSpec, issues] = validateSchemasSpec(schemaDefinition)
      } else if (dataset.datasetDescription.jsonData && dataset.datasetDescription.jsonData.HEDVersion) {
        ;[schemasSpec, issues] = parseSchemasSpec(dataset.datasetDescription.jsonData.HEDVersion)
      } else {
        ;[schemasSpec, issues] = [null, [generateIssue('invalidSchemaSpecification', { spec: 'no schema available' })]]
      }
      if (issues.length > 0) {
        return Promise.reject(issues)
      } else {
        return buildSchemas(schemasSpec).then(([schemas]) => [schemas, issues])
      }
    }
    function validateSchemasSpec(schemasSpec) {
      if (schemasSpec instanceof SchemasSpec) {
        return [schemasSpec, []]
      } else if (schemasSpec instanceof Map) {
        const newSchemasSpec = new SchemasSpec()
        newSchemasSpec.data = schemasSpec
        return [newSchemasSpec, []]
      } else if ('version' in schemasSpec || 'path' in schemasSpec || 'libraries' in schemasSpec) {
        return [convertOldSpecToSchemasSpec(schemasSpec), []]
      } else {
        return [null, [generateIssue('invalidSchemaSpecification', { spec: JSON.stringify(schemasSpec) })]]
      }
    }
    function convertOldSpecToSchemasSpec(oldSpec) {
      const newSpec = new SchemasSpec()
      return newSpec
    }
    function parseSchemasSpec(hedVersion) {
      const schemasSpec = new SchemasSpec()
      const processVersion = asArray(hedVersion)
      const issues = []
      for (const schemaVersion of processVersion) {
        const [schemaSpec, verIssues] = parseSchemaSpec(schemaVersion)
        if (verIssues.length > 0) {
          issues.push(...verIssues)
        } else if (schemasSpec.isDuplicate(schemaSpec)) {
          issues.push(generateIssue('invalidSchemaNickname', { spec: schemaVersion, nickname: schemaSpec.nickname }))
        } else {
          schemasSpec.addSchemaSpec(schemaSpec)
        }
      }
      return [schemasSpec, issues]
    }
    function parseSchemaSpec(schemaVersion) {
      const nicknameSplit = schemaVersion.split(':')
      let nickname = ''
      let schema
      if (nicknameSplit.length > 2) {
        return [null, [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
      }
      if (nicknameSplit.length > 1) {
        ;[nickname, schema] = nicknameSplit
        if (nickname === '' || !alphanumericRegExp.test(nickname)) {
          return [null, [generateIssue('invalidSchemaNickname', { nickname, spec: schemaVersion })]]
        }
      } else {
        schema = nicknameSplit[0]
      }
      const versionSplit = schema.split('_')
      let library = ''
      let version
      if (versionSplit.length > 2) {
        return [null, [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
      }
      if (versionSplit.length > 1) {
        ;[library, version] = versionSplit
        if (library === '' || !alphanumericRegExp.test(library)) {
          return [null, [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
        }
      } else {
        version = versionSplit[0]
      }
      if (!semver.valid(version)) {
        return [null, [generateIssue('invalidSchemaSpecification', { spec: schemaVersion })]]
      }
      const schemaSpec = new SchemaSpec(nickname, version, library)
      return [schemaSpec, []]
    }
    function validateSchemaSpec(schemaSpec) {
      if (!(schemaSpec instanceof SchemaSpec)) {
        return [null, [generateIssue('invalidSchemaSpecification', { spec: JSON.stringify(schemaSpec) })]]
      }
      return [schemaSpec, []]
    }
    module.exports = {
      buildBidsSchemas,
      validateSchemaSpec,
      validateSchemasSpec,
      parseSchemaSpec,
      parseSchemasSpec,
    }
  },
})

// validator/bids/validate.js
var require_validate = __commonJS({
  'validator/bids/validate.js'(exports, module) {
    init_define_process()
    var { validateHedDatasetWithContext } = require_dataset()
    var { validateHedString } = require_event()
    var { BidsDataset, BidsHedIssue, BidsIssue } = require_types4()
    var { buildBidsSchemas } = require_schema3()
    function validateBidsDataset(dataset, schemaDefinition) {
      return buildBidsSchemas(dataset, schemaDefinition).then(
        ([hedSchemas, schemaLoadIssues]) => {
          return validateFullDataset(dataset, hedSchemas)
            .catch(BidsIssue.generateInternalErrorPromise)
            .then((issues) =>
              issues.concat(convertHedIssuesToBidsIssues(schemaLoadIssues, dataset.datasetDescription.file)),
            )
        },
        (issues) => convertHedIssuesToBidsIssues(issues, dataset.datasetDescription.file),
      )
    }
    function validateFullDataset(dataset, hedSchemas) {
      try {
        const [sidecarErrorsFound, sidecarIssues] = validateSidecars(dataset.sidecarData, hedSchemas)
        const [hedColumnErrorsFound, hedColumnIssues] = validateHedColumn(dataset.eventData, hedSchemas)
        if (sidecarErrorsFound || hedColumnErrorsFound) {
          return Promise.resolve([].concat(sidecarIssues, hedColumnIssues))
        }
        const eventFileIssues = dataset.eventData.map((eventFileData) => {
          return validateBidsEventFile(eventFileData, hedSchemas)
        })
        return Promise.resolve([].concat(sidecarIssues, hedColumnIssues, ...eventFileIssues))
      } catch (e) {
        return Promise.reject(e)
      }
    }
    function validateBidsEventFile(eventFileData, hedSchemas) {
      const [hedStrings, tsvIssues] = parseTsvHed(eventFileData)
      if (!hedStrings) {
        return []
      } else {
        const datasetIssues = validateCombinedDataset(hedStrings, hedSchemas, eventFileData)
        return [].concat(tsvIssues, datasetIssues)
      }
    }
    function validateSidecars(sidecarData, hedSchema) {
      const issues = []
      let sidecarErrorsFound = false
      for (const sidecar of sidecarData) {
        const valueStringIssues = validateStrings(sidecar.hedValueStrings, hedSchema, sidecar.file, true)
        const categoricalStringIssues = validateStrings(sidecar.hedCategoricalStrings, hedSchema, sidecar.file, false)
        const fileIssues = [].concat(valueStringIssues, categoricalStringIssues)
        sidecarErrorsFound =
          sidecarErrorsFound ||
          fileIssues.some((fileIssue) => {
            return fileIssue.isError()
          })
        issues.push(...fileIssues)
      }
      return [sidecarErrorsFound, issues]
    }
    function validateHedColumn(eventData, hedSchemas) {
      const issues = eventData.flatMap((eventFileData) => {
        return validateStrings(eventFileData.hedColumnHedStrings, hedSchemas, eventFileData.file, false)
      })
      const errorsFound = issues.some((issue) => {
        return issue.isError()
      })
      return [errorsFound, issues]
    }
    function parseTsvHed(eventFileData) {
      const hedStrings = []
      const issues = []
      const sidecarHedColumnIndices = {}
      for (const sidecarHedColumn of eventFileData.sidecarHedData.keys()) {
        const sidecarHedColumnHeader = eventFileData.parsedTsv.headers.indexOf(sidecarHedColumn)
        if (sidecarHedColumnHeader > -1) {
          sidecarHedColumnIndices[sidecarHedColumn] = sidecarHedColumnHeader
        }
      }
      if (eventFileData.hedColumnHedStrings.length + sidecarHedColumnIndices.length === 0) {
        return [[], []]
      }
      eventFileData.parsedTsv.rows.slice(1).forEach((rowCells, rowIndex) => {
        const hedStringParts = []
        if (eventFileData.hedColumnHedStrings[rowIndex]) {
          hedStringParts.push(eventFileData.hedColumnHedStrings[rowIndex])
        }
        for (const sidecarHedColumn of Object.keys(sidecarHedColumnIndices)) {
          const sidecarHedIndex = sidecarHedColumnIndices[sidecarHedColumn]
          const sidecarHedData = eventFileData.sidecarHedData.get(sidecarHedColumn)
          const rowCell = rowCells[sidecarHedIndex]
          if (rowCell && rowCell !== 'n/a') {
            let sidecarHedString
            if (!sidecarHedData) {
              continue
            }
            if (typeof sidecarHedData === 'string') {
              sidecarHedString = sidecarHedData.replace('#', rowCell)
            } else {
              sidecarHedString = sidecarHedData[rowCell]
            }
            if (sidecarHedString !== void 0) {
              hedStringParts.push(sidecarHedString)
            } else {
              issues.push(new BidsIssue(108, eventFileData.file, rowCell))
            }
          }
        }
        if (hedStringParts.length > 0) {
          hedStrings.push(hedStringParts.join(','))
        }
      })
      return [hedStrings, issues]
    }
    function validateCombinedDataset(hedStrings, hedSchema, eventFileData) {
      const [isHedDatasetValid, hedIssues] = validateHedDatasetWithContext(
        hedStrings,
        eventFileData.mergedSidecar.hedStrings,
        hedSchema,
        true,
      )
      if (!isHedDatasetValid) {
        return convertHedIssuesToBidsIssues(hedIssues, eventFileData.file)
      } else {
        return []
      }
    }
    function validateStrings(hedStrings, hedSchema, fileObject, areValueStrings = false) {
      const issues = []
      for (const hedString of hedStrings) {
        if (!hedString) {
          continue
        }
        const [isHedStringValid, hedIssues] = validateHedString(hedString, hedSchema, true, areValueStrings)
        if (!isHedStringValid) {
          const convertedIssues = convertHedIssuesToBidsIssues(hedIssues, fileObject)
          issues.push(...convertedIssues)
        }
      }
      return issues
    }
    function convertHedIssuesToBidsIssues(hedIssues, file) {
      return hedIssues.map((hedIssue) => new BidsHedIssue(hedIssue, file))
    }
    module.exports = { validateBidsDataset }
  },
})

// validator/bids/index.js
var require_bids2 = __commonJS({
  'validator/bids/index.js'(exports, module) {
    init_define_process()
    var { BidsDataset, BidsEventFile, BidsHedIssue, BidsIssue, BidsJsonFile, BidsSidecar } = require_types4()
    var { validateBidsDataset } = require_validate()
    module.exports = {
      BidsDataset,
      BidsEventFile,
      BidsHedIssue,
      BidsIssue,
      BidsJsonFile,
      BidsSidecar,
      validateBidsDataset,
    }
  },
})

// validator/index.js
var require_validator2 = __commonJS({
  'validator/index.js'(exports, module) {
    init_define_process()
    var { BidsDataset, BidsEventFile, BidsJsonFile, BidsSidecar, validateBidsDataset } = require_bids2()
    var { validateHedDataset } = require_dataset()
    var { validateHedEvent, validateHedString } = require_event()
    var { buildSchema, buildSchemas } = require_init2()
    module.exports = {
      BidsDataset,
      BidsEventFile,
      BidsJsonFile,
      BidsSidecar,
      buildSchema,
      buildSchemas,
      validateBidsDataset,
      validateHedDataset,
      validateHedEvent,
      validateHedString,
    }
  },
})

// index.js
var require_hed_javascript = __commonJS({
  'index.js'(exports, module) {
    init_define_process()
    var converter = require_converter2()
    var validator = require_validator2()
    module.exports = {
      converter,
      validator,
    }
  },
})
export default require_hed_javascript()
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
/**
 * @preserve date-and-time.js (c) KNOWLEDGECODE | MIT
 */
//# sourceMappingURL=index.js.map
