var __getOwnPropNames = Object.getOwnPropertyNames
var __commonJS = (cb, mod) =>
  function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports
  }

// converter/types.js
var require_types = __commonJS({
  'converter/types.js'(exports2, module2) {
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
    module2.exports = {
      TagEntry,
      Mapping,
    }
  },
})

// utils/array.js
var require_array = __commonJS({
  'utils/array.js'(exports2, module2) {
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
    module2.exports = {
      getElementCount,
      asArray,
      recursiveMap,
    }
  },
})

// node_modules/date-and-time/date-and-time.js
var require_date_and_time = __commonJS({
  'node_modules/date-and-time/date-and-time.js'(exports2, module2) {
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
      if (typeof module2 === 'object' && typeof module2.exports === 'object') {
        module2.exports = date
      } else if (typeof define === 'function' && define.amd) {
        define([], function () {
          return date
        })
      } else {
        global2.date = date
      }
    })(exports2)
  },
})

// node_modules/date-fns/_lib/toInteger/index.js
var require_toInteger = __commonJS({
  'node_modules/date-fns/_lib/toInteger/index.js'(exports2, module2) {
    'use strict'
    Object.defineProperty(exports2, '__esModule', {
      value: true,
    })
    exports2.default = toInteger
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
    module2.exports = exports2.default
  },
})

// node_modules/date-fns/_lib/requiredArgs/index.js
var require_requiredArgs = __commonJS({
  'node_modules/date-fns/_lib/requiredArgs/index.js'(exports2, module2) {
    'use strict'
    Object.defineProperty(exports2, '__esModule', {
      value: true,
    })
    exports2.default = requiredArgs
    function requiredArgs(required, args) {
      if (args.length < required) {
        throw new TypeError(
          required + ' argument' + (required > 1 ? 's' : '') + ' required, but only ' + args.length + ' present',
        )
      }
    }
    module2.exports = exports2.default
  },
})

// node_modules/date-fns/parseISO/index.js
var require_parseISO = __commonJS({
  'node_modules/date-fns/parseISO/index.js'(exports2, module2) {
    'use strict'
    Object.defineProperty(exports2, '__esModule', {
      value: true,
    })
    exports2.default = parseISO
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
    module2.exports = exports2.default
  },
})

// node_modules/date-fns/toDate/index.js
var require_toDate = __commonJS({
  'node_modules/date-fns/toDate/index.js'(exports2, module2) {
    'use strict'
    Object.defineProperty(exports2, '__esModule', {
      value: true,
    })
    exports2.default = toDate
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
    module2.exports = exports2.default
  },
})

// node_modules/date-fns/isValid/index.js
var require_isValid = __commonJS({
  'node_modules/date-fns/isValid/index.js'(exports2, module2) {
    'use strict'
    Object.defineProperty(exports2, '__esModule', {
      value: true,
    })
    exports2.default = isValid
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
    module2.exports = exports2.default
  },
})

// utils/string.js
var require_string = __commonJS({
  'utils/string.js'(exports2, module2) {
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
    module2.exports = {
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
  'common/issues/data.js'(exports2, module2) {
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
    module2.exports = issueData
  },
})

// common/issues/issues.js
var require_issues = __commonJS({
  'common/issues/issues.js'(exports2, module2) {
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
    module2.exports = {
      generateIssue,
      Issue,
    }
  },
})

// converter/issues.js
var require_issues2 = __commonJS({
  'converter/issues.js'(exports2, module2) {
    var issuesUtil = require_issues()
    var generateIssue = function (code, hedString, parameters = {}, bounds = []) {
      parameters.tag = hedString.slice(bounds[0], bounds[1])
      parameters.bounds = bounds
      const issue = issuesUtil.generateIssue(code, parameters)
      issue.sourceString = hedString
      return issue
    }
    module2.exports = generateIssue
  },
})

// converter/splitHedString.js
var require_splitHedString = __commonJS({
  'converter/splitHedString.js'(exports2, module2) {
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
    module2.exports = splitHedString
  },
})

// converter/converter.js
var require_converter = __commonJS({
  'converter/converter.js'(exports2, module2) {
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
    module2.exports = {
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
  'utils/xpath.js'(exports2, module2) {
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
    module2.exports = {
      find,
    }
  },
})

// common/schema/config.js
var require_config = __commonJS({
  'common/schema/config.js'(exports2, module2) {
    var fallbackFilePath = 'data/HED8.0.0.xml'
    var fallbackDirectory = 'data'
    var localSchemaList = /* @__PURE__ */ new Set(['HED8.0.0', 'HED_testlib_1.0.2'])
    module2.exports = {
      fallbackFilePath,
      fallbackDirectory,
      localSchemaList,
    }
  },
})

// node_modules/xml2js/lib/defaults.js
var require_defaults = __commonJS({
  'node_modules/xml2js/lib/defaults.js'(exports2) {
    ;(function () {
      exports2.defaults = {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/Utility.js
var require_Utility = __commonJS({
  'node_modules/xmlbuilder/lib/Utility.js'(exports2, module2) {
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
      module2.exports.assign = assign
      module2.exports.isFunction = isFunction
      module2.exports.isObject = isObject
      module2.exports.isArray = isArray
      module2.exports.isEmpty = isEmpty
      module2.exports.isPlainObject = isPlainObject
      module2.exports.getValue = getValue
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDOMImplementation.js
var require_XMLDOMImplementation = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDOMImplementation.js'(exports2, module2) {
    ;(function () {
      var XMLDOMImplementation
      module2.exports = XMLDOMImplementation = (function () {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDOMErrorHandler.js
var require_XMLDOMErrorHandler = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDOMErrorHandler.js'(exports2, module2) {
    ;(function () {
      var XMLDOMErrorHandler
      module2.exports = XMLDOMErrorHandler = (function () {
        function XMLDOMErrorHandler2() {}
        XMLDOMErrorHandler2.prototype.handleError = function (error) {
          throw new Error(error)
        }
        return XMLDOMErrorHandler2
      })()
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDOMStringList.js
var require_XMLDOMStringList = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDOMStringList.js'(exports2, module2) {
    ;(function () {
      var XMLDOMStringList
      module2.exports = XMLDOMStringList = (function () {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDOMConfiguration.js
var require_XMLDOMConfiguration = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDOMConfiguration.js'(exports2, module2) {
    ;(function () {
      var XMLDOMConfiguration, XMLDOMErrorHandler, XMLDOMStringList
      XMLDOMErrorHandler = require_XMLDOMErrorHandler()
      XMLDOMStringList = require_XMLDOMStringList()
      module2.exports = XMLDOMConfiguration = (function () {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/NodeType.js
var require_NodeType = __commonJS({
  'node_modules/xmlbuilder/lib/NodeType.js'(exports2, module2) {
    ;(function () {
      module2.exports = {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLAttribute.js
var require_XMLAttribute = __commonJS({
  'node_modules/xmlbuilder/lib/XMLAttribute.js'(exports2, module2) {
    ;(function () {
      var NodeType, XMLAttribute, XMLNode
      NodeType = require_NodeType()
      XMLNode = require_XMLNode()
      module2.exports = XMLAttribute = (function () {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLNamedNodeMap.js
var require_XMLNamedNodeMap = __commonJS({
  'node_modules/xmlbuilder/lib/XMLNamedNodeMap.js'(exports2, module2) {
    ;(function () {
      var XMLNamedNodeMap
      module2.exports = XMLNamedNodeMap = (function () {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLElement.js
var require_XMLElement = __commonJS({
  'node_modules/xmlbuilder/lib/XMLElement.js'(exports2, module2) {
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
      module2.exports = XMLElement = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLCharacterData.js
var require_XMLCharacterData = __commonJS({
  'node_modules/xmlbuilder/lib/XMLCharacterData.js'(exports2, module2) {
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
      module2.exports = XMLCharacterData = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLCData.js
var require_XMLCData = __commonJS({
  'node_modules/xmlbuilder/lib/XMLCData.js'(exports2, module2) {
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
      module2.exports = XMLCData = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLComment.js
var require_XMLComment = __commonJS({
  'node_modules/xmlbuilder/lib/XMLComment.js'(exports2, module2) {
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
      module2.exports = XMLComment = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDeclaration.js
var require_XMLDeclaration = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDeclaration.js'(exports2, module2) {
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
      module2.exports = XMLDeclaration = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDTDAttList.js
var require_XMLDTDAttList = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDTDAttList.js'(exports2, module2) {
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
      module2.exports = XMLDTDAttList = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDTDEntity.js
var require_XMLDTDEntity = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDTDEntity.js'(exports2, module2) {
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
      module2.exports = XMLDTDEntity = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDTDElement.js
var require_XMLDTDElement = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDTDElement.js'(exports2, module2) {
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
      module2.exports = XMLDTDElement = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDTDNotation.js
var require_XMLDTDNotation = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDTDNotation.js'(exports2, module2) {
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
      module2.exports = XMLDTDNotation = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDocType.js
var require_XMLDocType = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDocType.js'(exports2, module2) {
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
      module2.exports = XMLDocType = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLRaw.js
var require_XMLRaw = __commonJS({
  'node_modules/xmlbuilder/lib/XMLRaw.js'(exports2, module2) {
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
      module2.exports = XMLRaw = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLText.js
var require_XMLText = __commonJS({
  'node_modules/xmlbuilder/lib/XMLText.js'(exports2, module2) {
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
      module2.exports = XMLText = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLProcessingInstruction.js
var require_XMLProcessingInstruction = __commonJS({
  'node_modules/xmlbuilder/lib/XMLProcessingInstruction.js'(exports2, module2) {
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
      module2.exports = XMLProcessingInstruction = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDummy.js
var require_XMLDummy = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDummy.js'(exports2, module2) {
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
      module2.exports = XMLDummy = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLNodeList.js
var require_XMLNodeList = __commonJS({
  'node_modules/xmlbuilder/lib/XMLNodeList.js'(exports2, module2) {
    ;(function () {
      var XMLNodeList
      module2.exports = XMLNodeList = (function () {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/DocumentPosition.js
var require_DocumentPosition = __commonJS({
  'node_modules/xmlbuilder/lib/DocumentPosition.js'(exports2, module2) {
    ;(function () {
      module2.exports = {
        Disconnected: 1,
        Preceding: 2,
        Following: 4,
        Contains: 8,
        ContainedBy: 16,
        ImplementationSpecific: 32,
      }
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLNode.js
var require_XMLNode = __commonJS({
  'node_modules/xmlbuilder/lib/XMLNode.js'(exports2, module2) {
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
      module2.exports = XMLNode = (function () {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLStringifier.js
var require_XMLStringifier = __commonJS({
  'node_modules/xmlbuilder/lib/XMLStringifier.js'(exports2, module2) {
    ;(function () {
      var XMLStringifier,
        bind = function (fn, me) {
          return function () {
            return fn.apply(me, arguments)
          }
        },
        hasProp = {}.hasOwnProperty
      module2.exports = XMLStringifier = (function () {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/WriterState.js
var require_WriterState = __commonJS({
  'node_modules/xmlbuilder/lib/WriterState.js'(exports2, module2) {
    ;(function () {
      module2.exports = {
        None: 0,
        OpenTag: 1,
        InsideTag: 2,
        CloseTag: 3,
      }
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLWriterBase.js
var require_XMLWriterBase = __commonJS({
  'node_modules/xmlbuilder/lib/XMLWriterBase.js'(exports2, module2) {
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
      module2.exports = XMLWriterBase = (function () {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLStringWriter.js
var require_XMLStringWriter = __commonJS({
  'node_modules/xmlbuilder/lib/XMLStringWriter.js'(exports2, module2) {
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
      module2.exports = XMLStringWriter = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDocument.js
var require_XMLDocument = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDocument.js'(exports2, module2) {
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
      module2.exports = XMLDocument = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLDocumentCB.js
var require_XMLDocumentCB = __commonJS({
  'node_modules/xmlbuilder/lib/XMLDocumentCB.js'(exports2, module2) {
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
      module2.exports = XMLDocumentCB = (function () {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/XMLStreamWriter.js
var require_XMLStreamWriter = __commonJS({
  'node_modules/xmlbuilder/lib/XMLStreamWriter.js'(exports2, module2) {
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
      module2.exports = XMLStreamWriter = (function (superClass) {
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
    }.call(exports2))
  },
})

// node_modules/xmlbuilder/lib/index.js
var require_lib = __commonJS({
  'node_modules/xmlbuilder/lib/index.js'(exports2, module2) {
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
      module2.exports.create = function (name, xmldec, doctype, options) {
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
      module2.exports.begin = function (options, onData, onEnd) {
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
      module2.exports.stringWriter = function (options) {
        return new XMLStringWriter(options)
      }
      module2.exports.streamWriter = function (stream, options) {
        return new XMLStreamWriter(stream, options)
      }
      module2.exports.implementation = new XMLDOMImplementation()
      module2.exports.nodeType = NodeType
      module2.exports.writerState = WriterState
    }.call(exports2))
  },
})

// node_modules/xml2js/lib/builder.js
var require_builder = __commonJS({
  'node_modules/xml2js/lib/builder.js'(exports2) {
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
      exports2.Builder = (function () {
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
    }.call(exports2))
  },
})

// node_modules/sax/lib/sax.js
var require_sax = __commonJS({
  'node_modules/sax/lib/sax.js'(exports2) {
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
        Stream = require('stream').Stream
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
            var SD = require('string_decoder').StringDecoder
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
    })(typeof exports2 === 'undefined' ? (exports2.sax = {}) : exports2)
  },
})

// node_modules/xml2js/lib/bom.js
var require_bom = __commonJS({
  'node_modules/xml2js/lib/bom.js'(exports2) {
    ;(function () {
      'use strict'
      exports2.stripBOM = function (str) {
        if (str[0] === '\uFEFF') {
          return str.substring(1)
        } else {
          return str
        }
      }
    }.call(exports2))
  },
})

// node_modules/xml2js/lib/processors.js
var require_processors = __commonJS({
  'node_modules/xml2js/lib/processors.js'(exports2) {
    ;(function () {
      'use strict'
      var prefixMatch
      prefixMatch = new RegExp(/(?!xmlns)^.*:/)
      exports2.normalize = function (str) {
        return str.toLowerCase()
      }
      exports2.firstCharLowerCase = function (str) {
        return str.charAt(0).toLowerCase() + str.slice(1)
      }
      exports2.stripPrefix = function (str) {
        return str.replace(prefixMatch, '')
      }
      exports2.parseNumbers = function (str) {
        if (!isNaN(str)) {
          str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str)
        }
        return str
      }
      exports2.parseBooleans = function (str) {
        if (/^(?:true|false)$/i.test(str)) {
          str = str.toLowerCase() === 'true'
        }
        return str
      }
    }.call(exports2))
  },
})

// node_modules/xml2js/lib/parser.js
var require_parser = __commonJS({
  'node_modules/xml2js/lib/parser.js'(exports2) {
    ;(function () {
      'use strict'
      var bom,
        defaults,
        events,
        isEmpty,
        processItem,
        processors,
        sax,
        setImmediate2,
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
      events = require('events')
      bom = require_bom()
      processors = require_processors()
      setImmediate2 = require('timers').setImmediate
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
      exports2.Parser = (function (superClass) {
        extend(Parser, superClass)
        function Parser(opts) {
          this.parseStringPromise = bind(this.parseStringPromise, this)
          this.parseString = bind(this.parseString, this)
          this.reset = bind(this.reset, this)
          this.assignOrPush = bind(this.assignOrPush, this)
          this.processAsync = bind(this.processAsync, this)
          var key, ref, value
          if (!(this instanceof exports2.Parser)) {
            return new exports2.Parser(opts)
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
              return setImmediate2(this.processAsync)
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
              setImmediate2(this.processAsync)
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
      exports2.parseString = function (str, a, b) {
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
        parser = new exports2.Parser(options)
        return parser.parseString(str, cb)
      }
      exports2.parseStringPromise = function (str, a) {
        var options, parser
        if (typeof a === 'object') {
          options = a
        }
        parser = new exports2.Parser(options)
        return parser.parseStringPromise(str)
      }
    }.call(exports2))
  },
})

// node_modules/xml2js/lib/xml2js.js
var require_xml2js = __commonJS({
  'node_modules/xml2js/lib/xml2js.js'(exports2) {
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
      exports2.defaults = defaults.defaults
      exports2.processors = processors
      exports2.ValidationError = (function (superClass) {
        extend(ValidationError, superClass)
        function ValidationError(message) {
          this.message = message
        }
        return ValidationError
      })(Error)
      exports2.Builder = builder.Builder
      exports2.Parser = parser.Parser
      exports2.parseString = parser.parseString
      exports2.parseStringPromise = parser.parseStringPromise
    }.call(exports2))
  },
})

// node_modules/http-response-object/lib/index.js
var require_lib2 = __commonJS({
  'node_modules/http-response-object/lib/index.js'(exports2, module2) {
    'use strict'
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
    module2.exports = Response
  },
})

// node_modules/asap/raw.js
var require_raw = __commonJS({
  'node_modules/asap/raw.js'(exports2, module2) {
    'use strict'
    var domain
    var hasSetImmediate = typeof setImmediate === 'function'
    module2.exports = rawAsap
    function rawAsap(task) {
      if (!queue.length) {
        requestFlush()
        flushing = true
      }
      queue[queue.length] = task
    }
    var queue = []
    var flushing = false
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
    rawAsap.requestFlush = requestFlush
    function requestFlush() {
      var parentDomain = process.domain
      if (parentDomain) {
        if (!domain) {
          domain = require('domain')
        }
        domain.active = process.domain = null
      }
      if (flushing && hasSetImmediate) {
        setImmediate(flush)
      } else {
        process.nextTick(flush)
      }
      if (parentDomain) {
        domain.active = process.domain = parentDomain
      }
    }
  },
})

// node_modules/promise/lib/core.js
var require_core = __commonJS({
  'node_modules/promise/lib/core.js'(exports2, module2) {
    'use strict'
    var asap = require_raw()
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
    module2.exports = Promise2
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
  'node_modules/promise/lib/done.js'(exports2, module2) {
    'use strict'
    var Promise2 = require_core()
    module2.exports = Promise2
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
  'node_modules/promise/lib/finally.js'(exports2, module2) {
    'use strict'
    var Promise2 = require_core()
    module2.exports = Promise2
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
  'node_modules/promise/lib/es6-extensions.js'(exports2, module2) {
    'use strict'
    var Promise2 = require_core()
    module2.exports = Promise2
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

// node_modules/asap/asap.js
var require_asap = __commonJS({
  'node_modules/asap/asap.js'(exports2, module2) {
    'use strict'
    var rawAsap = require_raw()
    var freeTasks = []
    module2.exports = asap
    function asap(task) {
      var rawTask
      if (freeTasks.length) {
        rawTask = freeTasks.pop()
      } else {
        rawTask = new RawTask()
      }
      rawTask.task = task
      rawTask.domain = process.domain
      rawAsap(rawTask)
    }
    function RawTask() {
      this.task = null
      this.domain = null
    }
    RawTask.prototype.call = function () {
      if (this.domain) {
        this.domain.enter()
      }
      var threw = true
      try {
        this.task.call()
        threw = false
        if (this.domain) {
          this.domain.exit()
        }
      } finally {
        if (threw) {
          rawAsap.requestFlush()
        }
        this.task = null
        this.domain = null
        freeTasks.push(this)
      }
    }
  },
})

// node_modules/promise/lib/node-extensions.js
var require_node_extensions = __commonJS({
  'node_modules/promise/lib/node-extensions.js'(exports2, module2) {
    'use strict'
    var Promise2 = require_core()
    var asap = require_asap()
    module2.exports = Promise2
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
  'node_modules/promise/lib/synchronous.js'(exports2, module2) {
    'use strict'
    var Promise2 = require_core()
    module2.exports = Promise2
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
  'node_modules/promise/lib/index.js'(exports2, module2) {
    'use strict'
    module2.exports = require_core()
    require_done()
    require_finally()
    require_es6_extensions()
    require_node_extensions()
    require_synchronous()
  },
})

// node_modules/promise/index.js
var require_promise = __commonJS({
  'node_modules/promise/index.js'(exports2, module2) {
    'use strict'
    module2.exports = require_lib3()
  },
})

// node_modules/process-nextick-args/index.js
var require_process_nextick_args = __commonJS({
  'node_modules/process-nextick-args/index.js'(exports2, module2) {
    'use strict'
    if (
      typeof process === 'undefined' ||
      !process.version ||
      process.version.indexOf('v0.') === 0 ||
      (process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0)
    ) {
      module2.exports = { nextTick }
    } else {
      module2.exports = process
    }
    function nextTick(fn, arg1, arg2, arg3) {
      if (typeof fn !== 'function') {
        throw new TypeError('"callback" argument must be a function')
      }
      var len = arguments.length
      var args, i
      switch (len) {
        case 0:
        case 1:
          return process.nextTick(fn)
        case 2:
          return process.nextTick(function afterTickOne() {
            fn.call(null, arg1)
          })
        case 3:
          return process.nextTick(function afterTickTwo() {
            fn.call(null, arg1, arg2)
          })
        case 4:
          return process.nextTick(function afterTickThree() {
            fn.call(null, arg1, arg2, arg3)
          })
        default:
          args = new Array(len - 1)
          i = 0
          while (i < args.length) {
            args[i++] = arguments[i]
          }
          return process.nextTick(function afterTick() {
            fn.apply(null, args)
          })
      }
    }
  },
})

// node_modules/isarray/index.js
var require_isarray = __commonJS({
  'node_modules/isarray/index.js'(exports2, module2) {
    var toString = {}.toString
    module2.exports =
      Array.isArray ||
      function (arr) {
        return toString.call(arr) == '[object Array]'
      }
  },
})

// node_modules/readable-stream/lib/internal/streams/stream.js
var require_stream = __commonJS({
  'node_modules/readable-stream/lib/internal/streams/stream.js'(exports2, module2) {
    module2.exports = require('stream')
  },
})

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  'node_modules/safe-buffer/index.js'(exports2, module2) {
    var buffer = require('buffer')
    var Buffer2 = buffer.Buffer
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key]
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module2.exports = buffer
    } else {
      copyProps(buffer, exports2)
      exports2.Buffer = SafeBuffer
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

// node_modules/core-util-is/lib/util.js
var require_util = __commonJS({
  'node_modules/core-util-is/lib/util.js'(exports2) {
    function isArray(arg) {
      if (Array.isArray) {
        return Array.isArray(arg)
      }
      return objectToString(arg) === '[object Array]'
    }
    exports2.isArray = isArray
    function isBoolean(arg) {
      return typeof arg === 'boolean'
    }
    exports2.isBoolean = isBoolean
    function isNull(arg) {
      return arg === null
    }
    exports2.isNull = isNull
    function isNullOrUndefined(arg) {
      return arg == null
    }
    exports2.isNullOrUndefined = isNullOrUndefined
    function isNumber(arg) {
      return typeof arg === 'number'
    }
    exports2.isNumber = isNumber
    function isString(arg) {
      return typeof arg === 'string'
    }
    exports2.isString = isString
    function isSymbol(arg) {
      return typeof arg === 'symbol'
    }
    exports2.isSymbol = isSymbol
    function isUndefined(arg) {
      return arg === void 0
    }
    exports2.isUndefined = isUndefined
    function isRegExp(re) {
      return objectToString(re) === '[object RegExp]'
    }
    exports2.isRegExp = isRegExp
    function isObject(arg) {
      return typeof arg === 'object' && arg !== null
    }
    exports2.isObject = isObject
    function isDate(d) {
      return objectToString(d) === '[object Date]'
    }
    exports2.isDate = isDate
    function isError(e) {
      return objectToString(e) === '[object Error]' || e instanceof Error
    }
    exports2.isError = isError
    function isFunction(arg) {
      return typeof arg === 'function'
    }
    exports2.isFunction = isFunction
    function isPrimitive(arg) {
      return (
        arg === null ||
        typeof arg === 'boolean' ||
        typeof arg === 'number' ||
        typeof arg === 'string' ||
        typeof arg === 'symbol' ||
        typeof arg === 'undefined'
      )
    }
    exports2.isPrimitive = isPrimitive
    exports2.isBuffer = Buffer.isBuffer
    function objectToString(o) {
      return Object.prototype.toString.call(o)
    }
  },
})

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  'node_modules/inherits/inherits_browser.js'(exports2, module2) {
    if (typeof Object.create === 'function') {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true,
            },
          })
        }
      }
    } else {
      module2.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor
          var TempCtor = function () {}
          TempCtor.prototype = superCtor.prototype
          ctor.prototype = new TempCtor()
          ctor.prototype.constructor = ctor
        }
      }
    }
  },
})

// node_modules/inherits/inherits.js
var require_inherits = __commonJS({
  'node_modules/inherits/inherits.js'(exports2, module2) {
    try {
      util = require('util')
      if (typeof util.inherits !== 'function') throw ''
      module2.exports = util.inherits
    } catch (e) {
      module2.exports = require_inherits_browser()
    }
    var util
  },
})

// node_modules/readable-stream/lib/internal/streams/BufferList.js
var require_BufferList = __commonJS({
  'node_modules/readable-stream/lib/internal/streams/BufferList.js'(exports2, module2) {
    'use strict'
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function')
      }
    }
    var Buffer2 = require_safe_buffer().Buffer
    var util = require('util')
    function copyBuffer(src, target, offset) {
      src.copy(target, offset)
    }
    module2.exports = (function () {
      function BufferList() {
        _classCallCheck(this, BufferList)
        this.head = null
        this.tail = null
        this.length = 0
      }
      BufferList.prototype.push = function push(v) {
        var entry = { data: v, next: null }
        if (this.length > 0) this.tail.next = entry
        else this.head = entry
        this.tail = entry
        ++this.length
      }
      BufferList.prototype.unshift = function unshift(v) {
        var entry = { data: v, next: this.head }
        if (this.length === 0) this.tail = entry
        this.head = entry
        ++this.length
      }
      BufferList.prototype.shift = function shift() {
        if (this.length === 0) return
        var ret = this.head.data
        if (this.length === 1) this.head = this.tail = null
        else this.head = this.head.next
        --this.length
        return ret
      }
      BufferList.prototype.clear = function clear() {
        this.head = this.tail = null
        this.length = 0
      }
      BufferList.prototype.join = function join(s) {
        if (this.length === 0) return ''
        var p = this.head
        var ret = '' + p.data
        while ((p = p.next)) {
          ret += s + p.data
        }
        return ret
      }
      BufferList.prototype.concat = function concat(n) {
        if (this.length === 0) return Buffer2.alloc(0)
        if (this.length === 1) return this.head.data
        var ret = Buffer2.allocUnsafe(n >>> 0)
        var p = this.head
        var i = 0
        while (p) {
          copyBuffer(p.data, ret, i)
          i += p.data.length
          p = p.next
        }
        return ret
      }
      return BufferList
    })()
    if (util && util.inspect && util.inspect.custom) {
      module2.exports.prototype[util.inspect.custom] = function () {
        var obj = util.inspect({ length: this.length })
        return this.constructor.name + ' ' + obj
      }
    }
  },
})

// node_modules/readable-stream/lib/internal/streams/destroy.js
var require_destroy = __commonJS({
  'node_modules/readable-stream/lib/internal/streams/destroy.js'(exports2, module2) {
    'use strict'
    var pna = require_process_nextick_args()
    function destroy(err, cb) {
      var _this = this
      var readableDestroyed = this._readableState && this._readableState.destroyed
      var writableDestroyed = this._writableState && this._writableState.destroyed
      if (readableDestroyed || writableDestroyed) {
        if (cb) {
          cb(err)
        } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
          pna.nextTick(emitErrorNT, this, err)
        }
        return this
      }
      if (this._readableState) {
        this._readableState.destroyed = true
      }
      if (this._writableState) {
        this._writableState.destroyed = true
      }
      this._destroy(err || null, function (err2) {
        if (!cb && err2) {
          pna.nextTick(emitErrorNT, _this, err2)
          if (_this._writableState) {
            _this._writableState.errorEmitted = true
          }
        } else if (cb) {
          cb(err2)
        }
      })
      return this
    }
    function undestroy() {
      if (this._readableState) {
        this._readableState.destroyed = false
        this._readableState.reading = false
        this._readableState.ended = false
        this._readableState.endEmitted = false
      }
      if (this._writableState) {
        this._writableState.destroyed = false
        this._writableState.ended = false
        this._writableState.ending = false
        this._writableState.finished = false
        this._writableState.errorEmitted = false
      }
    }
    function emitErrorNT(self2, err) {
      self2.emit('error', err)
    }
    module2.exports = {
      destroy,
      undestroy,
    }
  },
})

// node_modules/util-deprecate/node.js
var require_node = __commonJS({
  'node_modules/util-deprecate/node.js'(exports2, module2) {
    module2.exports = require('util').deprecate
  },
})

// node_modules/readable-stream/lib/_stream_writable.js
var require_stream_writable = __commonJS({
  'node_modules/readable-stream/lib/_stream_writable.js'(exports2, module2) {
    'use strict'
    var pna = require_process_nextick_args()
    module2.exports = Writable
    function CorkedRequest(state) {
      var _this = this
      this.next = null
      this.entry = null
      this.finish = function () {
        onCorkedFinish(_this, state)
      }
    }
    var asyncWrite =
      !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick
    var Duplex
    Writable.WritableState = WritableState
    var util = Object.create(require_util())
    util.inherits = require_inherits()
    var internalUtil = {
      deprecate: require_node(),
    }
    var Stream = require_stream()
    var Buffer2 = require_safe_buffer().Buffer
    var OurUint8Array = global.Uint8Array || function () {}
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk)
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array
    }
    var destroyImpl = require_destroy()
    util.inherits(Writable, Stream)
    function nop() {}
    function WritableState(options, stream) {
      Duplex = Duplex || require_stream_duplex()
      options = options || {}
      var isDuplex = stream instanceof Duplex
      this.objectMode = !!options.objectMode
      if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode
      var hwm = options.highWaterMark
      var writableHwm = options.writableHighWaterMark
      var defaultHwm = this.objectMode ? 16 : 16 * 1024
      if (hwm || hwm === 0) this.highWaterMark = hwm
      else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm
      else this.highWaterMark = defaultHwm
      this.highWaterMark = Math.floor(this.highWaterMark)
      this.finalCalled = false
      this.needDrain = false
      this.ending = false
      this.ended = false
      this.finished = false
      this.destroyed = false
      var noDecode = options.decodeStrings === false
      this.decodeStrings = !noDecode
      this.defaultEncoding = options.defaultEncoding || 'utf8'
      this.length = 0
      this.writing = false
      this.corked = 0
      this.sync = true
      this.bufferProcessing = false
      this.onwrite = function (er) {
        onwrite(stream, er)
      }
      this.writecb = null
      this.writelen = 0
      this.bufferedRequest = null
      this.lastBufferedRequest = null
      this.pendingcb = 0
      this.prefinished = false
      this.errorEmitted = false
      this.bufferedRequestCount = 0
      this.corkedRequestsFree = new CorkedRequest(this)
    }
    WritableState.prototype.getBuffer = function getBuffer() {
      var current = this.bufferedRequest
      var out = []
      while (current) {
        out.push(current)
        current = current.next
      }
      return out
    }
    ;(function () {
      try {
        Object.defineProperty(WritableState.prototype, 'buffer', {
          get: internalUtil.deprecate(
            function () {
              return this.getBuffer()
            },
            '_writableState.buffer is deprecated. Use _writableState.getBuffer instead.',
            'DEP0003',
          ),
        })
      } catch (_) {}
    })()
    var realHasInstance
    if (
      typeof Symbol === 'function' &&
      Symbol.hasInstance &&
      typeof Function.prototype[Symbol.hasInstance] === 'function'
    ) {
      realHasInstance = Function.prototype[Symbol.hasInstance]
      Object.defineProperty(Writable, Symbol.hasInstance, {
        value: function (object) {
          if (realHasInstance.call(this, object)) return true
          if (this !== Writable) return false
          return object && object._writableState instanceof WritableState
        },
      })
    } else {
      realHasInstance = function (object) {
        return object instanceof this
      }
    }
    function Writable(options) {
      Duplex = Duplex || require_stream_duplex()
      if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
        return new Writable(options)
      }
      this._writableState = new WritableState(options, this)
      this.writable = true
      if (options) {
        if (typeof options.write === 'function') this._write = options.write
        if (typeof options.writev === 'function') this._writev = options.writev
        if (typeof options.destroy === 'function') this._destroy = options.destroy
        if (typeof options.final === 'function') this._final = options.final
      }
      Stream.call(this)
    }
    Writable.prototype.pipe = function () {
      this.emit('error', new Error('Cannot pipe, not readable'))
    }
    function writeAfterEnd(stream, cb) {
      var er = new Error('write after end')
      stream.emit('error', er)
      pna.nextTick(cb, er)
    }
    function validChunk(stream, state, chunk, cb) {
      var valid = true
      var er = false
      if (chunk === null) {
        er = new TypeError('May not write null values to stream')
      } else if (typeof chunk !== 'string' && chunk !== void 0 && !state.objectMode) {
        er = new TypeError('Invalid non-string/buffer chunk')
      }
      if (er) {
        stream.emit('error', er)
        pna.nextTick(cb, er)
        valid = false
      }
      return valid
    }
    Writable.prototype.write = function (chunk, encoding, cb) {
      var state = this._writableState
      var ret = false
      var isBuf = !state.objectMode && _isUint8Array(chunk)
      if (isBuf && !Buffer2.isBuffer(chunk)) {
        chunk = _uint8ArrayToBuffer(chunk)
      }
      if (typeof encoding === 'function') {
        cb = encoding
        encoding = null
      }
      if (isBuf) encoding = 'buffer'
      else if (!encoding) encoding = state.defaultEncoding
      if (typeof cb !== 'function') cb = nop
      if (state.ended) writeAfterEnd(this, cb)
      else if (isBuf || validChunk(this, state, chunk, cb)) {
        state.pendingcb++
        ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb)
      }
      return ret
    }
    Writable.prototype.cork = function () {
      var state = this._writableState
      state.corked++
    }
    Writable.prototype.uncork = function () {
      var state = this._writableState
      if (state.corked) {
        state.corked--
        if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest)
          clearBuffer(this, state)
      }
    }
    Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
      if (typeof encoding === 'string') encoding = encoding.toLowerCase()
      if (
        !(
          ['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf(
            (encoding + '').toLowerCase(),
          ) > -1
        )
      )
        throw new TypeError('Unknown encoding: ' + encoding)
      this._writableState.defaultEncoding = encoding
      return this
    }
    function decodeChunk(state, chunk, encoding) {
      if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
        chunk = Buffer2.from(chunk, encoding)
      }
      return chunk
    }
    Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
      enumerable: false,
      get: function () {
        return this._writableState.highWaterMark
      },
    })
    function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
      if (!isBuf) {
        var newChunk = decodeChunk(state, chunk, encoding)
        if (chunk !== newChunk) {
          isBuf = true
          encoding = 'buffer'
          chunk = newChunk
        }
      }
      var len = state.objectMode ? 1 : chunk.length
      state.length += len
      var ret = state.length < state.highWaterMark
      if (!ret) state.needDrain = true
      if (state.writing || state.corked) {
        var last = state.lastBufferedRequest
        state.lastBufferedRequest = {
          chunk,
          encoding,
          isBuf,
          callback: cb,
          next: null,
        }
        if (last) {
          last.next = state.lastBufferedRequest
        } else {
          state.bufferedRequest = state.lastBufferedRequest
        }
        state.bufferedRequestCount += 1
      } else {
        doWrite(stream, state, false, len, chunk, encoding, cb)
      }
      return ret
    }
    function doWrite(stream, state, writev, len, chunk, encoding, cb) {
      state.writelen = len
      state.writecb = cb
      state.writing = true
      state.sync = true
      if (writev) stream._writev(chunk, state.onwrite)
      else stream._write(chunk, encoding, state.onwrite)
      state.sync = false
    }
    function onwriteError(stream, state, sync, er, cb) {
      --state.pendingcb
      if (sync) {
        pna.nextTick(cb, er)
        pna.nextTick(finishMaybe, stream, state)
        stream._writableState.errorEmitted = true
        stream.emit('error', er)
      } else {
        cb(er)
        stream._writableState.errorEmitted = true
        stream.emit('error', er)
        finishMaybe(stream, state)
      }
    }
    function onwriteStateUpdate(state) {
      state.writing = false
      state.writecb = null
      state.length -= state.writelen
      state.writelen = 0
    }
    function onwrite(stream, er) {
      var state = stream._writableState
      var sync = state.sync
      var cb = state.writecb
      onwriteStateUpdate(state)
      if (er) onwriteError(stream, state, sync, er, cb)
      else {
        var finished = needFinish(state)
        if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
          clearBuffer(stream, state)
        }
        if (sync) {
          asyncWrite(afterWrite, stream, state, finished, cb)
        } else {
          afterWrite(stream, state, finished, cb)
        }
      }
    }
    function afterWrite(stream, state, finished, cb) {
      if (!finished) onwriteDrain(stream, state)
      state.pendingcb--
      cb()
      finishMaybe(stream, state)
    }
    function onwriteDrain(stream, state) {
      if (state.length === 0 && state.needDrain) {
        state.needDrain = false
        stream.emit('drain')
      }
    }
    function clearBuffer(stream, state) {
      state.bufferProcessing = true
      var entry = state.bufferedRequest
      if (stream._writev && entry && entry.next) {
        var l = state.bufferedRequestCount
        var buffer = new Array(l)
        var holder = state.corkedRequestsFree
        holder.entry = entry
        var count = 0
        var allBuffers = true
        while (entry) {
          buffer[count] = entry
          if (!entry.isBuf) allBuffers = false
          entry = entry.next
          count += 1
        }
        buffer.allBuffers = allBuffers
        doWrite(stream, state, true, state.length, buffer, '', holder.finish)
        state.pendingcb++
        state.lastBufferedRequest = null
        if (holder.next) {
          state.corkedRequestsFree = holder.next
          holder.next = null
        } else {
          state.corkedRequestsFree = new CorkedRequest(state)
        }
        state.bufferedRequestCount = 0
      } else {
        while (entry) {
          var chunk = entry.chunk
          var encoding = entry.encoding
          var cb = entry.callback
          var len = state.objectMode ? 1 : chunk.length
          doWrite(stream, state, false, len, chunk, encoding, cb)
          entry = entry.next
          state.bufferedRequestCount--
          if (state.writing) {
            break
          }
        }
        if (entry === null) state.lastBufferedRequest = null
      }
      state.bufferedRequest = entry
      state.bufferProcessing = false
    }
    Writable.prototype._write = function (chunk, encoding, cb) {
      cb(new Error('_write() is not implemented'))
    }
    Writable.prototype._writev = null
    Writable.prototype.end = function (chunk, encoding, cb) {
      var state = this._writableState
      if (typeof chunk === 'function') {
        cb = chunk
        chunk = null
        encoding = null
      } else if (typeof encoding === 'function') {
        cb = encoding
        encoding = null
      }
      if (chunk !== null && chunk !== void 0) this.write(chunk, encoding)
      if (state.corked) {
        state.corked = 1
        this.uncork()
      }
      if (!state.ending && !state.finished) endWritable(this, state, cb)
    }
    function needFinish(state) {
      return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing
    }
    function callFinal(stream, state) {
      stream._final(function (err) {
        state.pendingcb--
        if (err) {
          stream.emit('error', err)
        }
        state.prefinished = true
        stream.emit('prefinish')
        finishMaybe(stream, state)
      })
    }
    function prefinish(stream, state) {
      if (!state.prefinished && !state.finalCalled) {
        if (typeof stream._final === 'function') {
          state.pendingcb++
          state.finalCalled = true
          pna.nextTick(callFinal, stream, state)
        } else {
          state.prefinished = true
          stream.emit('prefinish')
        }
      }
    }
    function finishMaybe(stream, state) {
      var need = needFinish(state)
      if (need) {
        prefinish(stream, state)
        if (state.pendingcb === 0) {
          state.finished = true
          stream.emit('finish')
        }
      }
      return need
    }
    function endWritable(stream, state, cb) {
      state.ending = true
      finishMaybe(stream, state)
      if (cb) {
        if (state.finished) pna.nextTick(cb)
        else stream.once('finish', cb)
      }
      state.ended = true
      stream.writable = false
    }
    function onCorkedFinish(corkReq, state, err) {
      var entry = corkReq.entry
      corkReq.entry = null
      while (entry) {
        var cb = entry.callback
        state.pendingcb--
        cb(err)
        entry = entry.next
      }
      if (state.corkedRequestsFree) {
        state.corkedRequestsFree.next = corkReq
      } else {
        state.corkedRequestsFree = corkReq
      }
    }
    Object.defineProperty(Writable.prototype, 'destroyed', {
      get: function () {
        if (this._writableState === void 0) {
          return false
        }
        return this._writableState.destroyed
      },
      set: function (value) {
        if (!this._writableState) {
          return
        }
        this._writableState.destroyed = value
      },
    })
    Writable.prototype.destroy = destroyImpl.destroy
    Writable.prototype._undestroy = destroyImpl.undestroy
    Writable.prototype._destroy = function (err, cb) {
      this.end()
      cb(err)
    }
  },
})

// node_modules/readable-stream/lib/_stream_duplex.js
var require_stream_duplex = __commonJS({
  'node_modules/readable-stream/lib/_stream_duplex.js'(exports2, module2) {
    'use strict'
    var pna = require_process_nextick_args()
    var objectKeys =
      Object.keys ||
      function (obj) {
        var keys2 = []
        for (var key in obj) {
          keys2.push(key)
        }
        return keys2
      }
    module2.exports = Duplex
    var util = Object.create(require_util())
    util.inherits = require_inherits()
    var Readable = require_stream_readable()
    var Writable = require_stream_writable()
    util.inherits(Duplex, Readable)
    {
      keys = objectKeys(Writable.prototype)
      for (v = 0; v < keys.length; v++) {
        method = keys[v]
        if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method]
      }
    }
    var keys
    var method
    var v
    function Duplex(options) {
      if (!(this instanceof Duplex)) return new Duplex(options)
      Readable.call(this, options)
      Writable.call(this, options)
      if (options && options.readable === false) this.readable = false
      if (options && options.writable === false) this.writable = false
      this.allowHalfOpen = true
      if (options && options.allowHalfOpen === false) this.allowHalfOpen = false
      this.once('end', onend)
    }
    Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
      enumerable: false,
      get: function () {
        return this._writableState.highWaterMark
      },
    })
    function onend() {
      if (this.allowHalfOpen || this._writableState.ended) return
      pna.nextTick(onEndNT, this)
    }
    function onEndNT(self2) {
      self2.end()
    }
    Object.defineProperty(Duplex.prototype, 'destroyed', {
      get: function () {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return false
        }
        return this._readableState.destroyed && this._writableState.destroyed
      },
      set: function (value) {
        if (this._readableState === void 0 || this._writableState === void 0) {
          return
        }
        this._readableState.destroyed = value
        this._writableState.destroyed = value
      },
    })
    Duplex.prototype._destroy = function (err, cb) {
      this.push(null)
      this.end()
      pna.nextTick(cb, err)
    }
  },
})

// node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  'node_modules/string_decoder/lib/string_decoder.js'(exports2) {
    'use strict'
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
    exports2.StringDecoder = StringDecoder
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

// node_modules/readable-stream/lib/_stream_readable.js
var require_stream_readable = __commonJS({
  'node_modules/readable-stream/lib/_stream_readable.js'(exports2, module2) {
    'use strict'
    var pna = require_process_nextick_args()
    module2.exports = Readable
    var isArray = require_isarray()
    var Duplex
    Readable.ReadableState = ReadableState
    var EE = require('events').EventEmitter
    var EElistenerCount = function (emitter, type) {
      return emitter.listeners(type).length
    }
    var Stream = require_stream()
    var Buffer2 = require_safe_buffer().Buffer
    var OurUint8Array = global.Uint8Array || function () {}
    function _uint8ArrayToBuffer(chunk) {
      return Buffer2.from(chunk)
    }
    function _isUint8Array(obj) {
      return Buffer2.isBuffer(obj) || obj instanceof OurUint8Array
    }
    var util = Object.create(require_util())
    util.inherits = require_inherits()
    var debugUtil = require('util')
    var debug = void 0
    if (debugUtil && debugUtil.debuglog) {
      debug = debugUtil.debuglog('stream')
    } else {
      debug = function () {}
    }
    var BufferList = require_BufferList()
    var destroyImpl = require_destroy()
    var StringDecoder
    util.inherits(Readable, Stream)
    var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume']
    function prependListener(emitter, event, fn) {
      if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn)
      if (!emitter._events || !emitter._events[event]) emitter.on(event, fn)
      else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn)
      else emitter._events[event] = [fn, emitter._events[event]]
    }
    function ReadableState(options, stream) {
      Duplex = Duplex || require_stream_duplex()
      options = options || {}
      var isDuplex = stream instanceof Duplex
      this.objectMode = !!options.objectMode
      if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode
      var hwm = options.highWaterMark
      var readableHwm = options.readableHighWaterMark
      var defaultHwm = this.objectMode ? 16 : 16 * 1024
      if (hwm || hwm === 0) this.highWaterMark = hwm
      else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm
      else this.highWaterMark = defaultHwm
      this.highWaterMark = Math.floor(this.highWaterMark)
      this.buffer = new BufferList()
      this.length = 0
      this.pipes = null
      this.pipesCount = 0
      this.flowing = null
      this.ended = false
      this.endEmitted = false
      this.reading = false
      this.sync = true
      this.needReadable = false
      this.emittedReadable = false
      this.readableListening = false
      this.resumeScheduled = false
      this.destroyed = false
      this.defaultEncoding = options.defaultEncoding || 'utf8'
      this.awaitDrain = 0
      this.readingMore = false
      this.decoder = null
      this.encoding = null
      if (options.encoding) {
        if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder
        this.decoder = new StringDecoder(options.encoding)
        this.encoding = options.encoding
      }
    }
    function Readable(options) {
      Duplex = Duplex || require_stream_duplex()
      if (!(this instanceof Readable)) return new Readable(options)
      this._readableState = new ReadableState(options, this)
      this.readable = true
      if (options) {
        if (typeof options.read === 'function') this._read = options.read
        if (typeof options.destroy === 'function') this._destroy = options.destroy
      }
      Stream.call(this)
    }
    Object.defineProperty(Readable.prototype, 'destroyed', {
      get: function () {
        if (this._readableState === void 0) {
          return false
        }
        return this._readableState.destroyed
      },
      set: function (value) {
        if (!this._readableState) {
          return
        }
        this._readableState.destroyed = value
      },
    })
    Readable.prototype.destroy = destroyImpl.destroy
    Readable.prototype._undestroy = destroyImpl.undestroy
    Readable.prototype._destroy = function (err, cb) {
      this.push(null)
      cb(err)
    }
    Readable.prototype.push = function (chunk, encoding) {
      var state = this._readableState
      var skipChunkCheck
      if (!state.objectMode) {
        if (typeof chunk === 'string') {
          encoding = encoding || state.defaultEncoding
          if (encoding !== state.encoding) {
            chunk = Buffer2.from(chunk, encoding)
            encoding = ''
          }
          skipChunkCheck = true
        }
      } else {
        skipChunkCheck = true
      }
      return readableAddChunk(this, chunk, encoding, false, skipChunkCheck)
    }
    Readable.prototype.unshift = function (chunk) {
      return readableAddChunk(this, chunk, null, true, false)
    }
    function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
      var state = stream._readableState
      if (chunk === null) {
        state.reading = false
        onEofChunk(stream, state)
      } else {
        var er
        if (!skipChunkCheck) er = chunkInvalid(state, chunk)
        if (er) {
          stream.emit('error', er)
        } else if (state.objectMode || (chunk && chunk.length > 0)) {
          if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer2.prototype) {
            chunk = _uint8ArrayToBuffer(chunk)
          }
          if (addToFront) {
            if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'))
            else addChunk(stream, state, chunk, true)
          } else if (state.ended) {
            stream.emit('error', new Error('stream.push() after EOF'))
          } else {
            state.reading = false
            if (state.decoder && !encoding) {
              chunk = state.decoder.write(chunk)
              if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false)
              else maybeReadMore(stream, state)
            } else {
              addChunk(stream, state, chunk, false)
            }
          }
        } else if (!addToFront) {
          state.reading = false
        }
      }
      return needMoreData(state)
    }
    function addChunk(stream, state, chunk, addToFront) {
      if (state.flowing && state.length === 0 && !state.sync) {
        stream.emit('data', chunk)
        stream.read(0)
      } else {
        state.length += state.objectMode ? 1 : chunk.length
        if (addToFront) state.buffer.unshift(chunk)
        else state.buffer.push(chunk)
        if (state.needReadable) emitReadable(stream)
      }
      maybeReadMore(stream, state)
    }
    function chunkInvalid(state, chunk) {
      var er
      if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== void 0 && !state.objectMode) {
        er = new TypeError('Invalid non-string/buffer chunk')
      }
      return er
    }
    function needMoreData(state) {
      return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0)
    }
    Readable.prototype.isPaused = function () {
      return this._readableState.flowing === false
    }
    Readable.prototype.setEncoding = function (enc) {
      if (!StringDecoder) StringDecoder = require_string_decoder().StringDecoder
      this._readableState.decoder = new StringDecoder(enc)
      this._readableState.encoding = enc
      return this
    }
    var MAX_HWM = 8388608
    function computeNewHighWaterMark(n) {
      if (n >= MAX_HWM) {
        n = MAX_HWM
      } else {
        n--
        n |= n >>> 1
        n |= n >>> 2
        n |= n >>> 4
        n |= n >>> 8
        n |= n >>> 16
        n++
      }
      return n
    }
    function howMuchToRead(n, state) {
      if (n <= 0 || (state.length === 0 && state.ended)) return 0
      if (state.objectMode) return 1
      if (n !== n) {
        if (state.flowing && state.length) return state.buffer.head.data.length
        else return state.length
      }
      if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n)
      if (n <= state.length) return n
      if (!state.ended) {
        state.needReadable = true
        return 0
      }
      return state.length
    }
    Readable.prototype.read = function (n) {
      debug('read', n)
      n = parseInt(n, 10)
      var state = this._readableState
      var nOrig = n
      if (n !== 0) state.emittedReadable = false
      if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
        debug('read: emitReadable', state.length, state.ended)
        if (state.length === 0 && state.ended) endReadable(this)
        else emitReadable(this)
        return null
      }
      n = howMuchToRead(n, state)
      if (n === 0 && state.ended) {
        if (state.length === 0) endReadable(this)
        return null
      }
      var doRead = state.needReadable
      debug('need readable', doRead)
      if (state.length === 0 || state.length - n < state.highWaterMark) {
        doRead = true
        debug('length less than watermark', doRead)
      }
      if (state.ended || state.reading) {
        doRead = false
        debug('reading or ended', doRead)
      } else if (doRead) {
        debug('do read')
        state.reading = true
        state.sync = true
        if (state.length === 0) state.needReadable = true
        this._read(state.highWaterMark)
        state.sync = false
        if (!state.reading) n = howMuchToRead(nOrig, state)
      }
      var ret
      if (n > 0) ret = fromList(n, state)
      else ret = null
      if (ret === null) {
        state.needReadable = true
        n = 0
      } else {
        state.length -= n
      }
      if (state.length === 0) {
        if (!state.ended) state.needReadable = true
        if (nOrig !== n && state.ended) endReadable(this)
      }
      if (ret !== null) this.emit('data', ret)
      return ret
    }
    function onEofChunk(stream, state) {
      if (state.ended) return
      if (state.decoder) {
        var chunk = state.decoder.end()
        if (chunk && chunk.length) {
          state.buffer.push(chunk)
          state.length += state.objectMode ? 1 : chunk.length
        }
      }
      state.ended = true
      emitReadable(stream)
    }
    function emitReadable(stream) {
      var state = stream._readableState
      state.needReadable = false
      if (!state.emittedReadable) {
        debug('emitReadable', state.flowing)
        state.emittedReadable = true
        if (state.sync) pna.nextTick(emitReadable_, stream)
        else emitReadable_(stream)
      }
    }
    function emitReadable_(stream) {
      debug('emit readable')
      stream.emit('readable')
      flow(stream)
    }
    function maybeReadMore(stream, state) {
      if (!state.readingMore) {
        state.readingMore = true
        pna.nextTick(maybeReadMore_, stream, state)
      }
    }
    function maybeReadMore_(stream, state) {
      var len = state.length
      while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
        debug('maybeReadMore read 0')
        stream.read(0)
        if (len === state.length) break
        else len = state.length
      }
      state.readingMore = false
    }
    Readable.prototype._read = function (n) {
      this.emit('error', new Error('_read() is not implemented'))
    }
    Readable.prototype.pipe = function (dest, pipeOpts) {
      var src = this
      var state = this._readableState
      switch (state.pipesCount) {
        case 0:
          state.pipes = dest
          break
        case 1:
          state.pipes = [state.pipes, dest]
          break
        default:
          state.pipes.push(dest)
          break
      }
      state.pipesCount += 1
      debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts)
      var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr
      var endFn = doEnd ? onend : unpipe
      if (state.endEmitted) pna.nextTick(endFn)
      else src.once('end', endFn)
      dest.on('unpipe', onunpipe)
      function onunpipe(readable, unpipeInfo) {
        debug('onunpipe')
        if (readable === src) {
          if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
            unpipeInfo.hasUnpiped = true
            cleanup()
          }
        }
      }
      function onend() {
        debug('onend')
        dest.end()
      }
      var ondrain = pipeOnDrain(src)
      dest.on('drain', ondrain)
      var cleanedUp = false
      function cleanup() {
        debug('cleanup')
        dest.removeListener('close', onclose)
        dest.removeListener('finish', onfinish)
        dest.removeListener('drain', ondrain)
        dest.removeListener('error', onerror)
        dest.removeListener('unpipe', onunpipe)
        src.removeListener('end', onend)
        src.removeListener('end', unpipe)
        src.removeListener('data', ondata)
        cleanedUp = true
        if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain()
      }
      var increasedAwaitDrain = false
      src.on('data', ondata)
      function ondata(chunk) {
        debug('ondata')
        increasedAwaitDrain = false
        var ret = dest.write(chunk)
        if (false === ret && !increasedAwaitDrain) {
          if (
            ((state.pipesCount === 1 && state.pipes === dest) ||
              (state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1)) &&
            !cleanedUp
          ) {
            debug('false write response, pause', src._readableState.awaitDrain)
            src._readableState.awaitDrain++
            increasedAwaitDrain = true
          }
          src.pause()
        }
      }
      function onerror(er) {
        debug('onerror', er)
        unpipe()
        dest.removeListener('error', onerror)
        if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er)
      }
      prependListener(dest, 'error', onerror)
      function onclose() {
        dest.removeListener('finish', onfinish)
        unpipe()
      }
      dest.once('close', onclose)
      function onfinish() {
        debug('onfinish')
        dest.removeListener('close', onclose)
        unpipe()
      }
      dest.once('finish', onfinish)
      function unpipe() {
        debug('unpipe')
        src.unpipe(dest)
      }
      dest.emit('pipe', src)
      if (!state.flowing) {
        debug('pipe resume')
        src.resume()
      }
      return dest
    }
    function pipeOnDrain(src) {
      return function () {
        var state = src._readableState
        debug('pipeOnDrain', state.awaitDrain)
        if (state.awaitDrain) state.awaitDrain--
        if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
          state.flowing = true
          flow(src)
        }
      }
    }
    Readable.prototype.unpipe = function (dest) {
      var state = this._readableState
      var unpipeInfo = { hasUnpiped: false }
      if (state.pipesCount === 0) return this
      if (state.pipesCount === 1) {
        if (dest && dest !== state.pipes) return this
        if (!dest) dest = state.pipes
        state.pipes = null
        state.pipesCount = 0
        state.flowing = false
        if (dest) dest.emit('unpipe', this, unpipeInfo)
        return this
      }
      if (!dest) {
        var dests = state.pipes
        var len = state.pipesCount
        state.pipes = null
        state.pipesCount = 0
        state.flowing = false
        for (var i = 0; i < len; i++) {
          dests[i].emit('unpipe', this, unpipeInfo)
        }
        return this
      }
      var index = indexOf(state.pipes, dest)
      if (index === -1) return this
      state.pipes.splice(index, 1)
      state.pipesCount -= 1
      if (state.pipesCount === 1) state.pipes = state.pipes[0]
      dest.emit('unpipe', this, unpipeInfo)
      return this
    }
    Readable.prototype.on = function (ev, fn) {
      var res = Stream.prototype.on.call(this, ev, fn)
      if (ev === 'data') {
        if (this._readableState.flowing !== false) this.resume()
      } else if (ev === 'readable') {
        var state = this._readableState
        if (!state.endEmitted && !state.readableListening) {
          state.readableListening = state.needReadable = true
          state.emittedReadable = false
          if (!state.reading) {
            pna.nextTick(nReadingNextTick, this)
          } else if (state.length) {
            emitReadable(this)
          }
        }
      }
      return res
    }
    Readable.prototype.addListener = Readable.prototype.on
    function nReadingNextTick(self2) {
      debug('readable nexttick read 0')
      self2.read(0)
    }
    Readable.prototype.resume = function () {
      var state = this._readableState
      if (!state.flowing) {
        debug('resume')
        state.flowing = true
        resume(this, state)
      }
      return this
    }
    function resume(stream, state) {
      if (!state.resumeScheduled) {
        state.resumeScheduled = true
        pna.nextTick(resume_, stream, state)
      }
    }
    function resume_(stream, state) {
      if (!state.reading) {
        debug('resume read 0')
        stream.read(0)
      }
      state.resumeScheduled = false
      state.awaitDrain = 0
      stream.emit('resume')
      flow(stream)
      if (state.flowing && !state.reading) stream.read(0)
    }
    Readable.prototype.pause = function () {
      debug('call pause flowing=%j', this._readableState.flowing)
      if (false !== this._readableState.flowing) {
        debug('pause')
        this._readableState.flowing = false
        this.emit('pause')
      }
      return this
    }
    function flow(stream) {
      var state = stream._readableState
      debug('flow', state.flowing)
      while (state.flowing && stream.read() !== null) {}
    }
    Readable.prototype.wrap = function (stream) {
      var _this = this
      var state = this._readableState
      var paused = false
      stream.on('end', function () {
        debug('wrapped end')
        if (state.decoder && !state.ended) {
          var chunk = state.decoder.end()
          if (chunk && chunk.length) _this.push(chunk)
        }
        _this.push(null)
      })
      stream.on('data', function (chunk) {
        debug('wrapped data')
        if (state.decoder) chunk = state.decoder.write(chunk)
        if (state.objectMode && (chunk === null || chunk === void 0)) return
        else if (!state.objectMode && (!chunk || !chunk.length)) return
        var ret = _this.push(chunk)
        if (!ret) {
          paused = true
          stream.pause()
        }
      })
      for (var i in stream) {
        if (this[i] === void 0 && typeof stream[i] === 'function') {
          this[i] = (function (method) {
            return function () {
              return stream[method].apply(stream, arguments)
            }
          })(i)
        }
      }
      for (var n = 0; n < kProxyEvents.length; n++) {
        stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]))
      }
      this._read = function (n2) {
        debug('wrapped _read', n2)
        if (paused) {
          paused = false
          stream.resume()
        }
      }
      return this
    }
    Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
      enumerable: false,
      get: function () {
        return this._readableState.highWaterMark
      },
    })
    Readable._fromList = fromList
    function fromList(n, state) {
      if (state.length === 0) return null
      var ret
      if (state.objectMode) ret = state.buffer.shift()
      else if (!n || n >= state.length) {
        if (state.decoder) ret = state.buffer.join('')
        else if (state.buffer.length === 1) ret = state.buffer.head.data
        else ret = state.buffer.concat(state.length)
        state.buffer.clear()
      } else {
        ret = fromListPartial(n, state.buffer, state.decoder)
      }
      return ret
    }
    function fromListPartial(n, list, hasStrings) {
      var ret
      if (n < list.head.data.length) {
        ret = list.head.data.slice(0, n)
        list.head.data = list.head.data.slice(n)
      } else if (n === list.head.data.length) {
        ret = list.shift()
      } else {
        ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list)
      }
      return ret
    }
    function copyFromBufferString(n, list) {
      var p = list.head
      var c = 1
      var ret = p.data
      n -= ret.length
      while ((p = p.next)) {
        var str = p.data
        var nb = n > str.length ? str.length : n
        if (nb === str.length) ret += str
        else ret += str.slice(0, n)
        n -= nb
        if (n === 0) {
          if (nb === str.length) {
            ++c
            if (p.next) list.head = p.next
            else list.head = list.tail = null
          } else {
            list.head = p
            p.data = str.slice(nb)
          }
          break
        }
        ++c
      }
      list.length -= c
      return ret
    }
    function copyFromBuffer(n, list) {
      var ret = Buffer2.allocUnsafe(n)
      var p = list.head
      var c = 1
      p.data.copy(ret)
      n -= p.data.length
      while ((p = p.next)) {
        var buf = p.data
        var nb = n > buf.length ? buf.length : n
        buf.copy(ret, ret.length - n, 0, nb)
        n -= nb
        if (n === 0) {
          if (nb === buf.length) {
            ++c
            if (p.next) list.head = p.next
            else list.head = list.tail = null
          } else {
            list.head = p
            p.data = buf.slice(nb)
          }
          break
        }
        ++c
      }
      list.length -= c
      return ret
    }
    function endReadable(stream) {
      var state = stream._readableState
      if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream')
      if (!state.endEmitted) {
        state.ended = true
        pna.nextTick(endReadableNT, state, stream)
      }
    }
    function endReadableNT(state, stream) {
      if (!state.endEmitted && state.length === 0) {
        state.endEmitted = true
        stream.readable = false
        stream.emit('end')
      }
    }
    function indexOf(xs, x) {
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) return i
      }
      return -1
    }
  },
})

// node_modules/readable-stream/lib/_stream_transform.js
var require_stream_transform = __commonJS({
  'node_modules/readable-stream/lib/_stream_transform.js'(exports2, module2) {
    'use strict'
    module2.exports = Transform
    var Duplex = require_stream_duplex()
    var util = Object.create(require_util())
    util.inherits = require_inherits()
    util.inherits(Transform, Duplex)
    function afterTransform(er, data) {
      var ts = this._transformState
      ts.transforming = false
      var cb = ts.writecb
      if (!cb) {
        return this.emit('error', new Error('write callback called multiple times'))
      }
      ts.writechunk = null
      ts.writecb = null
      if (data != null) this.push(data)
      cb(er)
      var rs = this._readableState
      rs.reading = false
      if (rs.needReadable || rs.length < rs.highWaterMark) {
        this._read(rs.highWaterMark)
      }
    }
    function Transform(options) {
      if (!(this instanceof Transform)) return new Transform(options)
      Duplex.call(this, options)
      this._transformState = {
        afterTransform: afterTransform.bind(this),
        needTransform: false,
        transforming: false,
        writecb: null,
        writechunk: null,
        writeencoding: null,
      }
      this._readableState.needReadable = true
      this._readableState.sync = false
      if (options) {
        if (typeof options.transform === 'function') this._transform = options.transform
        if (typeof options.flush === 'function') this._flush = options.flush
      }
      this.on('prefinish', prefinish)
    }
    function prefinish() {
      var _this = this
      if (typeof this._flush === 'function') {
        this._flush(function (er, data) {
          done(_this, er, data)
        })
      } else {
        done(this, null, null)
      }
    }
    Transform.prototype.push = function (chunk, encoding) {
      this._transformState.needTransform = false
      return Duplex.prototype.push.call(this, chunk, encoding)
    }
    Transform.prototype._transform = function (chunk, encoding, cb) {
      throw new Error('_transform() is not implemented')
    }
    Transform.prototype._write = function (chunk, encoding, cb) {
      var ts = this._transformState
      ts.writecb = cb
      ts.writechunk = chunk
      ts.writeencoding = encoding
      if (!ts.transforming) {
        var rs = this._readableState
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark)
      }
    }
    Transform.prototype._read = function (n) {
      var ts = this._transformState
      if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
        ts.transforming = true
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform)
      } else {
        ts.needTransform = true
      }
    }
    Transform.prototype._destroy = function (err, cb) {
      var _this2 = this
      Duplex.prototype._destroy.call(this, err, function (err2) {
        cb(err2)
        _this2.emit('close')
      })
    }
    function done(stream, er, data) {
      if (er) return stream.emit('error', er)
      if (data != null) stream.push(data)
      if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0')
      if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming')
      return stream.push(null)
    }
  },
})

// node_modules/readable-stream/lib/_stream_passthrough.js
var require_stream_passthrough = __commonJS({
  'node_modules/readable-stream/lib/_stream_passthrough.js'(exports2, module2) {
    'use strict'
    module2.exports = PassThrough
    var Transform = require_stream_transform()
    var util = Object.create(require_util())
    util.inherits = require_inherits()
    util.inherits(PassThrough, Transform)
    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options)
      Transform.call(this, options)
    }
    PassThrough.prototype._transform = function (chunk, encoding, cb) {
      cb(null, chunk)
    }
  },
})

// node_modules/readable-stream/readable.js
var require_readable = __commonJS({
  'node_modules/readable-stream/readable.js'(exports2, module2) {
    var Stream = require('stream')
    if (process.env.READABLE_STREAM === 'disable' && Stream) {
      module2.exports = Stream
      exports2 = module2.exports = Stream.Readable
      exports2.Readable = Stream.Readable
      exports2.Writable = Stream.Writable
      exports2.Duplex = Stream.Duplex
      exports2.Transform = Stream.Transform
      exports2.PassThrough = Stream.PassThrough
      exports2.Stream = Stream
    } else {
      exports2 = module2.exports = require_stream_readable()
      exports2.Stream = Stream || exports2
      exports2.Readable = exports2
      exports2.Writable = require_stream_writable()
      exports2.Duplex = require_stream_duplex()
      exports2.Transform = require_stream_transform()
      exports2.PassThrough = require_stream_passthrough()
    }
  },
})

// node_modules/buffer-from/index.js
var require_buffer_from = __commonJS({
  'node_modules/buffer-from/index.js'(exports2, module2) {
    var toString = Object.prototype.toString
    var isModern =
      typeof Buffer.alloc === 'function' &&
      typeof Buffer.allocUnsafe === 'function' &&
      typeof Buffer.from === 'function'
    function isArrayBuffer(input) {
      return toString.call(input).slice(8, -1) === 'ArrayBuffer'
    }
    function fromArrayBuffer(obj, byteOffset, length) {
      byteOffset >>>= 0
      var maxLength = obj.byteLength - byteOffset
      if (maxLength < 0) {
        throw new RangeError("'offset' is out of bounds")
      }
      if (length === void 0) {
        length = maxLength
      } else {
        length >>>= 0
        if (length > maxLength) {
          throw new RangeError("'length' is out of bounds")
        }
      }
      return isModern
        ? Buffer.from(obj.slice(byteOffset, byteOffset + length))
        : new Buffer(new Uint8Array(obj.slice(byteOffset, byteOffset + length)))
    }
    function fromString(string, encoding) {
      if (typeof encoding !== 'string' || encoding === '') {
        encoding = 'utf8'
      }
      if (!Buffer.isEncoding(encoding)) {
        throw new TypeError('"encoding" must be a valid string encoding')
      }
      return isModern ? Buffer.from(string, encoding) : new Buffer(string, encoding)
    }
    function bufferFrom(value, encodingOrOffset, length) {
      if (typeof value === 'number') {
        throw new TypeError('"value" argument must not be a number')
      }
      if (isArrayBuffer(value)) {
        return fromArrayBuffer(value, encodingOrOffset, length)
      }
      if (typeof value === 'string') {
        return fromString(value, encodingOrOffset)
      }
      return isModern ? Buffer.from(value) : new Buffer(value)
    }
    module2.exports = bufferFrom
  },
})

// node_modules/typedarray/index.js
var require_typedarray = __commonJS({
  'node_modules/typedarray/index.js'(exports2) {
    var undefined2 = void 0
    var MAX_ARRAY_LENGTH = 1e5
    var ECMAScript = (function () {
      var opts = Object.prototype.toString,
        ophop = Object.prototype.hasOwnProperty
      return {
        Class: function (v) {
          return opts.call(v).replace(/^\[object *|\]$/g, '')
        },
        HasProperty: function (o, p) {
          return p in o
        },
        HasOwnProperty: function (o, p) {
          return ophop.call(o, p)
        },
        IsCallable: function (o) {
          return typeof o === 'function'
        },
        ToInt32: function (v) {
          return v >> 0
        },
        ToUint32: function (v) {
          return v >>> 0
        },
      }
    })()
    var LN2 = Math.LN2
    var abs = Math.abs
    var floor = Math.floor
    var log = Math.log
    var min = Math.min
    var pow = Math.pow
    var round = Math.round
    function configureProperties(obj) {
      if (getOwnPropNames && defineProp) {
        var props = getOwnPropNames(obj),
          i
        for (i = 0; i < props.length; i += 1) {
          defineProp(obj, props[i], {
            value: obj[props[i]],
            writable: false,
            enumerable: false,
            configurable: false,
          })
        }
      }
    }
    var defineProp
    if (
      Object.defineProperty &&
      (function () {
        try {
          Object.defineProperty({}, 'x', {})
          return true
        } catch (e) {
          return false
        }
      })()
    ) {
      defineProp = Object.defineProperty
    } else {
      defineProp = function (o, p, desc) {
        if (!o === Object(o)) throw new TypeError('Object.defineProperty called on non-object')
        if (ECMAScript.HasProperty(desc, 'get') && Object.prototype.__defineGetter__) {
          Object.prototype.__defineGetter__.call(o, p, desc.get)
        }
        if (ECMAScript.HasProperty(desc, 'set') && Object.prototype.__defineSetter__) {
          Object.prototype.__defineSetter__.call(o, p, desc.set)
        }
        if (ECMAScript.HasProperty(desc, 'value')) {
          o[p] = desc.value
        }
        return o
      }
    }
    var getOwnPropNames =
      Object.getOwnPropertyNames ||
      function (o) {
        if (o !== Object(o)) throw new TypeError('Object.getOwnPropertyNames called on non-object')
        var props = [],
          p
        for (p in o) {
          if (ECMAScript.HasOwnProperty(o, p)) {
            props.push(p)
          }
        }
        return props
      }
    function makeArrayAccessors(obj) {
      if (!defineProp) {
        return
      }
      if (obj.length > MAX_ARRAY_LENGTH) throw new RangeError('Array too large for polyfill')
      function makeArrayAccessor(index) {
        defineProp(obj, index, {
          get: function () {
            return obj._getter(index)
          },
          set: function (v) {
            obj._setter(index, v)
          },
          enumerable: true,
          configurable: false,
        })
      }
      var i
      for (i = 0; i < obj.length; i += 1) {
        makeArrayAccessor(i)
      }
    }
    function as_signed(value, bits) {
      var s = 32 - bits
      return (value << s) >> s
    }
    function as_unsigned(value, bits) {
      var s = 32 - bits
      return (value << s) >>> s
    }
    function packI8(n) {
      return [n & 255]
    }
    function unpackI8(bytes) {
      return as_signed(bytes[0], 8)
    }
    function packU8(n) {
      return [n & 255]
    }
    function unpackU8(bytes) {
      return as_unsigned(bytes[0], 8)
    }
    function packU8Clamped(n) {
      n = round(Number(n))
      return [n < 0 ? 0 : n > 255 ? 255 : n & 255]
    }
    function packI16(n) {
      return [(n >> 8) & 255, n & 255]
    }
    function unpackI16(bytes) {
      return as_signed((bytes[0] << 8) | bytes[1], 16)
    }
    function packU16(n) {
      return [(n >> 8) & 255, n & 255]
    }
    function unpackU16(bytes) {
      return as_unsigned((bytes[0] << 8) | bytes[1], 16)
    }
    function packI32(n) {
      return [(n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255]
    }
    function unpackI32(bytes) {
      return as_signed((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3], 32)
    }
    function packU32(n) {
      return [(n >> 24) & 255, (n >> 16) & 255, (n >> 8) & 255, n & 255]
    }
    function unpackU32(bytes) {
      return as_unsigned((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3], 32)
    }
    function packIEEE754(v, ebits, fbits) {
      var bias = (1 << (ebits - 1)) - 1,
        s,
        e,
        f,
        ln,
        i,
        bits,
        str,
        bytes
      function roundToEven(n) {
        var w = floor(n),
          f2 = n - w
        if (f2 < 0.5) return w
        if (f2 > 0.5) return w + 1
        return w % 2 ? w + 1 : w
      }
      if (v !== v) {
        e = (1 << ebits) - 1
        f = pow(2, fbits - 1)
        s = 0
      } else if (v === Infinity || v === -Infinity) {
        e = (1 << ebits) - 1
        f = 0
        s = v < 0 ? 1 : 0
      } else if (v === 0) {
        e = 0
        f = 0
        s = 1 / v === -Infinity ? 1 : 0
      } else {
        s = v < 0
        v = abs(v)
        if (v >= pow(2, 1 - bias)) {
          e = min(floor(log(v) / LN2), 1023)
          f = roundToEven((v / pow(2, e)) * pow(2, fbits))
          if (f / pow(2, fbits) >= 2) {
            e = e + 1
            f = 1
          }
          if (e > bias) {
            e = (1 << ebits) - 1
            f = 0
          } else {
            e = e + bias
            f = f - pow(2, fbits)
          }
        } else {
          e = 0
          f = roundToEven(v / pow(2, 1 - bias - fbits))
        }
      }
      bits = []
      for (i = fbits; i; i -= 1) {
        bits.push(f % 2 ? 1 : 0)
        f = floor(f / 2)
      }
      for (i = ebits; i; i -= 1) {
        bits.push(e % 2 ? 1 : 0)
        e = floor(e / 2)
      }
      bits.push(s ? 1 : 0)
      bits.reverse()
      str = bits.join('')
      bytes = []
      while (str.length) {
        bytes.push(parseInt(str.substring(0, 8), 2))
        str = str.substring(8)
      }
      return bytes
    }
    function unpackIEEE754(bytes, ebits, fbits) {
      var bits = [],
        i,
        j,
        b,
        str,
        bias,
        s,
        e,
        f
      for (i = bytes.length; i; i -= 1) {
        b = bytes[i - 1]
        for (j = 8; j; j -= 1) {
          bits.push(b % 2 ? 1 : 0)
          b = b >> 1
        }
      }
      bits.reverse()
      str = bits.join('')
      bias = (1 << (ebits - 1)) - 1
      s = parseInt(str.substring(0, 1), 2) ? -1 : 1
      e = parseInt(str.substring(1, 1 + ebits), 2)
      f = parseInt(str.substring(1 + ebits), 2)
      if (e === (1 << ebits) - 1) {
        return f !== 0 ? NaN : s * Infinity
      } else if (e > 0) {
        return s * pow(2, e - bias) * (1 + f / pow(2, fbits))
      } else if (f !== 0) {
        return s * pow(2, -(bias - 1)) * (f / pow(2, fbits))
      } else {
        return s < 0 ? -0 : 0
      }
    }
    function unpackF64(b) {
      return unpackIEEE754(b, 11, 52)
    }
    function packF64(v) {
      return packIEEE754(v, 11, 52)
    }
    function unpackF32(b) {
      return unpackIEEE754(b, 8, 23)
    }
    function packF32(v) {
      return packIEEE754(v, 8, 23)
    }
    ;(function () {
      var ArrayBuffer2 = function ArrayBuffer3(length) {
        length = ECMAScript.ToInt32(length)
        if (length < 0) throw new RangeError('ArrayBuffer size is not a small enough positive integer')
        this.byteLength = length
        this._bytes = []
        this._bytes.length = length
        var i
        for (i = 0; i < this.byteLength; i += 1) {
          this._bytes[i] = 0
        }
        configureProperties(this)
      }
      exports2.ArrayBuffer = exports2.ArrayBuffer || ArrayBuffer2
      var ArrayBufferView = function ArrayBufferView2() {}
      function makeConstructor(bytesPerElement, pack, unpack) {
        var ctor
        ctor = function (buffer, byteOffset, length) {
          var array, sequence, i, s
          if (!arguments.length || typeof arguments[0] === 'number') {
            this.length = ECMAScript.ToInt32(arguments[0])
            if (length < 0) throw new RangeError('ArrayBufferView size is not a small enough positive integer')
            this.byteLength = this.length * this.BYTES_PER_ELEMENT
            this.buffer = new ArrayBuffer2(this.byteLength)
            this.byteOffset = 0
          } else if (typeof arguments[0] === 'object' && arguments[0].constructor === ctor) {
            array = arguments[0]
            this.length = array.length
            this.byteLength = this.length * this.BYTES_PER_ELEMENT
            this.buffer = new ArrayBuffer2(this.byteLength)
            this.byteOffset = 0
            for (i = 0; i < this.length; i += 1) {
              this._setter(i, array._getter(i))
            }
          } else if (
            typeof arguments[0] === 'object' &&
            !(arguments[0] instanceof ArrayBuffer2 || ECMAScript.Class(arguments[0]) === 'ArrayBuffer')
          ) {
            sequence = arguments[0]
            this.length = ECMAScript.ToUint32(sequence.length)
            this.byteLength = this.length * this.BYTES_PER_ELEMENT
            this.buffer = new ArrayBuffer2(this.byteLength)
            this.byteOffset = 0
            for (i = 0; i < this.length; i += 1) {
              s = sequence[i]
              this._setter(i, Number(s))
            }
          } else if (
            typeof arguments[0] === 'object' &&
            (arguments[0] instanceof ArrayBuffer2 || ECMAScript.Class(arguments[0]) === 'ArrayBuffer')
          ) {
            this.buffer = buffer
            this.byteOffset = ECMAScript.ToUint32(byteOffset)
            if (this.byteOffset > this.buffer.byteLength) {
              throw new RangeError('byteOffset out of range')
            }
            if (this.byteOffset % this.BYTES_PER_ELEMENT) {
              throw new RangeError('ArrayBuffer length minus the byteOffset is not a multiple of the element size.')
            }
            if (arguments.length < 3) {
              this.byteLength = this.buffer.byteLength - this.byteOffset
              if (this.byteLength % this.BYTES_PER_ELEMENT) {
                throw new RangeError('length of buffer minus byteOffset not a multiple of the element size')
              }
              this.length = this.byteLength / this.BYTES_PER_ELEMENT
            } else {
              this.length = ECMAScript.ToUint32(length)
              this.byteLength = this.length * this.BYTES_PER_ELEMENT
            }
            if (this.byteOffset + this.byteLength > this.buffer.byteLength) {
              throw new RangeError('byteOffset and length reference an area beyond the end of the buffer')
            }
          } else {
            throw new TypeError('Unexpected argument type(s)')
          }
          this.constructor = ctor
          configureProperties(this)
          makeArrayAccessors(this)
        }
        ctor.prototype = new ArrayBufferView()
        ctor.prototype.BYTES_PER_ELEMENT = bytesPerElement
        ctor.prototype._pack = pack
        ctor.prototype._unpack = unpack
        ctor.BYTES_PER_ELEMENT = bytesPerElement
        ctor.prototype._getter = function (index) {
          if (arguments.length < 1) throw new SyntaxError('Not enough arguments')
          index = ECMAScript.ToUint32(index)
          if (index >= this.length) {
            return undefined2
          }
          var bytes = [],
            i,
            o
          for (
            i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT;
            i < this.BYTES_PER_ELEMENT;
            i += 1, o += 1
          ) {
            bytes.push(this.buffer._bytes[o])
          }
          return this._unpack(bytes)
        }
        ctor.prototype.get = ctor.prototype._getter
        ctor.prototype._setter = function (index, value) {
          if (arguments.length < 2) throw new SyntaxError('Not enough arguments')
          index = ECMAScript.ToUint32(index)
          if (index >= this.length) {
            return undefined2
          }
          var bytes = this._pack(value),
            i,
            o
          for (
            i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT;
            i < this.BYTES_PER_ELEMENT;
            i += 1, o += 1
          ) {
            this.buffer._bytes[o] = bytes[i]
          }
        }
        ctor.prototype.set = function (index, value) {
          if (arguments.length < 1) throw new SyntaxError('Not enough arguments')
          var array, sequence, offset, len, i, s, d, byteOffset, byteLength, tmp
          if (typeof arguments[0] === 'object' && arguments[0].constructor === this.constructor) {
            array = arguments[0]
            offset = ECMAScript.ToUint32(arguments[1])
            if (offset + array.length > this.length) {
              throw new RangeError('Offset plus length of array is out of range')
            }
            byteOffset = this.byteOffset + offset * this.BYTES_PER_ELEMENT
            byteLength = array.length * this.BYTES_PER_ELEMENT
            if (array.buffer === this.buffer) {
              tmp = []
              for (i = 0, s = array.byteOffset; i < byteLength; i += 1, s += 1) {
                tmp[i] = array.buffer._bytes[s]
              }
              for (i = 0, d = byteOffset; i < byteLength; i += 1, d += 1) {
                this.buffer._bytes[d] = tmp[i]
              }
            } else {
              for (i = 0, s = array.byteOffset, d = byteOffset; i < byteLength; i += 1, s += 1, d += 1) {
                this.buffer._bytes[d] = array.buffer._bytes[s]
              }
            }
          } else if (typeof arguments[0] === 'object' && typeof arguments[0].length !== 'undefined') {
            sequence = arguments[0]
            len = ECMAScript.ToUint32(sequence.length)
            offset = ECMAScript.ToUint32(arguments[1])
            if (offset + len > this.length) {
              throw new RangeError('Offset plus length of array is out of range')
            }
            for (i = 0; i < len; i += 1) {
              s = sequence[i]
              this._setter(offset + i, Number(s))
            }
          } else {
            throw new TypeError('Unexpected argument type(s)')
          }
        }
        ctor.prototype.subarray = function (start, end) {
          function clamp(v, min2, max) {
            return v < min2 ? min2 : v > max ? max : v
          }
          start = ECMAScript.ToInt32(start)
          end = ECMAScript.ToInt32(end)
          if (arguments.length < 1) {
            start = 0
          }
          if (arguments.length < 2) {
            end = this.length
          }
          if (start < 0) {
            start = this.length + start
          }
          if (end < 0) {
            end = this.length + end
          }
          start = clamp(start, 0, this.length)
          end = clamp(end, 0, this.length)
          var len = end - start
          if (len < 0) {
            len = 0
          }
          return new this.constructor(this.buffer, this.byteOffset + start * this.BYTES_PER_ELEMENT, len)
        }
        return ctor
      }
      var Int8Array2 = makeConstructor(1, packI8, unpackI8)
      var Uint8Array2 = makeConstructor(1, packU8, unpackU8)
      var Uint8ClampedArray2 = makeConstructor(1, packU8Clamped, unpackU8)
      var Int16Array2 = makeConstructor(2, packI16, unpackI16)
      var Uint16Array2 = makeConstructor(2, packU16, unpackU16)
      var Int32Array2 = makeConstructor(4, packI32, unpackI32)
      var Uint32Array2 = makeConstructor(4, packU32, unpackU32)
      var Float32Array2 = makeConstructor(4, packF32, unpackF32)
      var Float64Array2 = makeConstructor(8, packF64, unpackF64)
      exports2.Int8Array = exports2.Int8Array || Int8Array2
      exports2.Uint8Array = exports2.Uint8Array || Uint8Array2
      exports2.Uint8ClampedArray = exports2.Uint8ClampedArray || Uint8ClampedArray2
      exports2.Int16Array = exports2.Int16Array || Int16Array2
      exports2.Uint16Array = exports2.Uint16Array || Uint16Array2
      exports2.Int32Array = exports2.Int32Array || Int32Array2
      exports2.Uint32Array = exports2.Uint32Array || Uint32Array2
      exports2.Float32Array = exports2.Float32Array || Float32Array2
      exports2.Float64Array = exports2.Float64Array || Float64Array2
    })()
    ;(function () {
      function r(array, index) {
        return ECMAScript.IsCallable(array.get) ? array.get(index) : array[index]
      }
      var IS_BIG_ENDIAN = (function () {
        var u16array = new exports2.Uint16Array([4660]),
          u8array = new exports2.Uint8Array(u16array.buffer)
        return r(u8array, 0) === 18
      })()
      var DataView2 = function DataView3(buffer, byteOffset, byteLength) {
        if (arguments.length === 0) {
          buffer = new exports2.ArrayBuffer(0)
        } else if (!(buffer instanceof exports2.ArrayBuffer || ECMAScript.Class(buffer) === 'ArrayBuffer')) {
          throw new TypeError('TypeError')
        }
        this.buffer = buffer || new exports2.ArrayBuffer(0)
        this.byteOffset = ECMAScript.ToUint32(byteOffset)
        if (this.byteOffset > this.buffer.byteLength) {
          throw new RangeError('byteOffset out of range')
        }
        if (arguments.length < 3) {
          this.byteLength = this.buffer.byteLength - this.byteOffset
        } else {
          this.byteLength = ECMAScript.ToUint32(byteLength)
        }
        if (this.byteOffset + this.byteLength > this.buffer.byteLength) {
          throw new RangeError('byteOffset and length reference an area beyond the end of the buffer')
        }
        configureProperties(this)
      }
      function makeGetter(arrayType) {
        return function (byteOffset, littleEndian) {
          byteOffset = ECMAScript.ToUint32(byteOffset)
          if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
            throw new RangeError('Array index out of range')
          }
          byteOffset += this.byteOffset
          var uint8Array = new exports2.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT),
            bytes = [],
            i
          for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
            bytes.push(r(uint8Array, i))
          }
          if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
            bytes.reverse()
          }
          return r(new arrayType(new exports2.Uint8Array(bytes).buffer), 0)
        }
      }
      DataView2.prototype.getUint8 = makeGetter(exports2.Uint8Array)
      DataView2.prototype.getInt8 = makeGetter(exports2.Int8Array)
      DataView2.prototype.getUint16 = makeGetter(exports2.Uint16Array)
      DataView2.prototype.getInt16 = makeGetter(exports2.Int16Array)
      DataView2.prototype.getUint32 = makeGetter(exports2.Uint32Array)
      DataView2.prototype.getInt32 = makeGetter(exports2.Int32Array)
      DataView2.prototype.getFloat32 = makeGetter(exports2.Float32Array)
      DataView2.prototype.getFloat64 = makeGetter(exports2.Float64Array)
      function makeSetter(arrayType) {
        return function (byteOffset, value, littleEndian) {
          byteOffset = ECMAScript.ToUint32(byteOffset)
          if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
            throw new RangeError('Array index out of range')
          }
          var typeArray = new arrayType([value]),
            byteArray = new exports2.Uint8Array(typeArray.buffer),
            bytes = [],
            i,
            byteView
          for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
            bytes.push(r(byteArray, i))
          }
          if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
            bytes.reverse()
          }
          byteView = new exports2.Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT)
          byteView.set(bytes)
        }
      }
      DataView2.prototype.setUint8 = makeSetter(exports2.Uint8Array)
      DataView2.prototype.setInt8 = makeSetter(exports2.Int8Array)
      DataView2.prototype.setUint16 = makeSetter(exports2.Uint16Array)
      DataView2.prototype.setInt16 = makeSetter(exports2.Int16Array)
      DataView2.prototype.setUint32 = makeSetter(exports2.Uint32Array)
      DataView2.prototype.setInt32 = makeSetter(exports2.Int32Array)
      DataView2.prototype.setFloat32 = makeSetter(exports2.Float32Array)
      DataView2.prototype.setFloat64 = makeSetter(exports2.Float64Array)
      exports2.DataView = exports2.DataView || DataView2
    })()
  },
})

// node_modules/concat-stream/index.js
var require_concat_stream = __commonJS({
  'node_modules/concat-stream/index.js'(exports2, module2) {
    var Writable = require_readable().Writable
    var inherits = require_inherits()
    var bufferFrom = require_buffer_from()
    if (typeof Uint8Array === 'undefined') {
      U8 = require_typedarray().Uint8Array
    } else {
      U8 = Uint8Array
    }
    var U8
    function ConcatStream(opts, cb) {
      if (!(this instanceof ConcatStream)) return new ConcatStream(opts, cb)
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }
      if (!opts) opts = {}
      var encoding = opts.encoding
      var shouldInferEncoding = false
      if (!encoding) {
        shouldInferEncoding = true
      } else {
        encoding = String(encoding).toLowerCase()
        if (encoding === 'u8' || encoding === 'uint8') {
          encoding = 'uint8array'
        }
      }
      Writable.call(this, { objectMode: true })
      this.encoding = encoding
      this.shouldInferEncoding = shouldInferEncoding
      if (cb)
        this.on('finish', function () {
          cb(this.getBody())
        })
      this.body = []
    }
    module2.exports = ConcatStream
    inherits(ConcatStream, Writable)
    ConcatStream.prototype._write = function (chunk, enc, next) {
      this.body.push(chunk)
      next()
    }
    ConcatStream.prototype.inferEncoding = function (buff) {
      var firstBuffer = buff === void 0 ? this.body[0] : buff
      if (Buffer.isBuffer(firstBuffer)) return 'buffer'
      if (typeof Uint8Array !== 'undefined' && firstBuffer instanceof Uint8Array) return 'uint8array'
      if (Array.isArray(firstBuffer)) return 'array'
      if (typeof firstBuffer === 'string') return 'string'
      if (Object.prototype.toString.call(firstBuffer) === '[object Object]') return 'object'
      return 'buffer'
    }
    ConcatStream.prototype.getBody = function () {
      if (!this.encoding && this.body.length === 0) return []
      if (this.shouldInferEncoding) this.encoding = this.inferEncoding()
      if (this.encoding === 'array') return arrayConcat(this.body)
      if (this.encoding === 'string') return stringConcat(this.body)
      if (this.encoding === 'buffer') return bufferConcat(this.body)
      if (this.encoding === 'uint8array') return u8Concat(this.body)
      return this.body
    }
    var isArray =
      Array.isArray ||
      function (arr) {
        return Object.prototype.toString.call(arr) == '[object Array]'
      }
    function isArrayish(arr) {
      return /Array\]$/.test(Object.prototype.toString.call(arr))
    }
    function isBufferish(p) {
      return typeof p === 'string' || isArrayish(p) || (p && typeof p.subarray === 'function')
    }
    function stringConcat(parts) {
      var strings = []
      var needsToString = false
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]
        if (typeof p === 'string') {
          strings.push(p)
        } else if (Buffer.isBuffer(p)) {
          strings.push(p)
        } else if (isBufferish(p)) {
          strings.push(bufferFrom(p))
        } else {
          strings.push(bufferFrom(String(p)))
        }
      }
      if (Buffer.isBuffer(parts[0])) {
        strings = Buffer.concat(strings)
        strings = strings.toString('utf8')
      } else {
        strings = strings.join('')
      }
      return strings
    }
    function bufferConcat(parts) {
      var bufs = []
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]
        if (Buffer.isBuffer(p)) {
          bufs.push(p)
        } else if (isBufferish(p)) {
          bufs.push(bufferFrom(p))
        } else {
          bufs.push(bufferFrom(String(p)))
        }
      }
      return Buffer.concat(bufs)
    }
    function arrayConcat(parts) {
      var res = []
      for (var i = 0; i < parts.length; i++) {
        res.push.apply(res, parts[i])
      }
      return res
    }
    function u8Concat(parts) {
      var len = 0
      for (var i = 0; i < parts.length; i++) {
        if (typeof parts[i] === 'string') {
          parts[i] = bufferFrom(parts[i])
        }
        len += parts[i].length
      }
      var u8 = new U8(len)
      for (var i = 0, offset = 0; i < parts.length; i++) {
        var part = parts[i]
        for (var j = 0; j < part.length; j++) {
          u8[offset++] = part[j]
        }
      }
      return u8
    }
  },
})

// node_modules/then-request/lib/ResponsePromise.js
var require_ResponsePromise = __commonJS({
  'node_modules/then-request/lib/ResponsePromise.js'(exports2) {
    'use strict'
    exports2.__esModule = true
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
    exports2['default'] = toResponsePromise
    exports2.ResponsePromise = void 0
  },
})

// node_modules/has-symbols/shams.js
var require_shams = __commonJS({
  'node_modules/has-symbols/shams.js'(exports2, module2) {
    'use strict'
    module2.exports = function hasSymbols() {
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
  'node_modules/has-symbols/index.js'(exports2, module2) {
    'use strict'
    var origSymbol = typeof Symbol !== 'undefined' && Symbol
    var hasSymbolSham = require_shams()
    module2.exports = function hasNativeSymbols() {
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
  'node_modules/function-bind/implementation.js'(exports2, module2) {
    'use strict'
    var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible '
    var slice = Array.prototype.slice
    var toStr = Object.prototype.toString
    var funcType = '[object Function]'
    module2.exports = function bind(that) {
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
  'node_modules/function-bind/index.js'(exports2, module2) {
    'use strict'
    var implementation = require_implementation()
    module2.exports = Function.prototype.bind || implementation
  },
})

// node_modules/has/src/index.js
var require_src = __commonJS({
  'node_modules/has/src/index.js'(exports2, module2) {
    'use strict'
    var bind = require_function_bind()
    module2.exports = bind.call(Function.call, Object.prototype.hasOwnProperty)
  },
})

// node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS({
  'node_modules/get-intrinsic/index.js'(exports2, module2) {
    'use strict'
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
    module2.exports = function GetIntrinsic(name, allowMissing) {
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
  'node_modules/call-bind/index.js'(exports2, module2) {
    'use strict'
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
    module2.exports = function callBind(originalFunction) {
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
      $defineProperty(module2.exports, 'apply', { value: applyBind })
    } else {
      module2.exports.apply = applyBind
    }
  },
})

// node_modules/call-bind/callBound.js
var require_callBound = __commonJS({
  'node_modules/call-bind/callBound.js'(exports2, module2) {
    'use strict'
    var GetIntrinsic = require_get_intrinsic()
    var callBind = require_call_bind()
    var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'))
    module2.exports = function callBoundIntrinsic(name, allowMissing) {
      var intrinsic = GetIntrinsic(name, !!allowMissing)
      if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
        return callBind(intrinsic)
      }
      return intrinsic
    }
  },
})

// node_modules/object-inspect/util.inspect.js
var require_util_inspect = __commonJS({
  'node_modules/object-inspect/util.inspect.js'(exports2, module2) {
    module2.exports = require('util').inspect
  },
})

// node_modules/object-inspect/index.js
var require_object_inspect = __commonJS({
  'node_modules/object-inspect/index.js'(exports2, module2) {
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
    var inspectCustom = require_util_inspect().custom
    var inspectSymbol = inspectCustom && isSymbol(inspectCustom) ? inspectCustom : null
    var toStringTag =
      typeof Symbol === 'function' && typeof Symbol.toStringTag !== 'undefined' ? Symbol.toStringTag : null
    module2.exports = function inspect_(obj, options, depth, seen) {
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
  'node_modules/side-channel/index.js'(exports2, module2) {
    'use strict'
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
    module2.exports = function getSideChannel() {
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
  'node_modules/qs/lib/formats.js'(exports2, module2) {
    'use strict'
    var replace = String.prototype.replace
    var percentTwenties = /%20/g
    var Format = {
      RFC1738: 'RFC1738',
      RFC3986: 'RFC3986',
    }
    module2.exports = {
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
  'node_modules/qs/lib/utils.js'(exports2, module2) {
    'use strict'
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
    module2.exports = {
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
  'node_modules/qs/lib/stringify.js'(exports2, module2) {
    'use strict'
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
    module2.exports = function (object, opts) {
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
  'node_modules/qs/lib/parse.js'(exports2, module2) {
    'use strict'
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
    module2.exports = function (str, opts) {
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
  'node_modules/qs/lib/index.js'(exports2, module2) {
    'use strict'
    var stringify = require_stringify()
    var parse = require_parse()
    var formats = require_formats()
    module2.exports = {
      formats,
      parse,
      stringify,
    }
  },
})

// node_modules/then-request/lib/handle-qs.js
var require_handle_qs = __commonJS({
  'node_modules/then-request/lib/handle-qs.js'(exports2) {
    'use strict'
    exports2.__esModule = true
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
    exports2['default'] = handleQs
  },
})

// node_modules/parse-cache-control/index.js
var require_parse_cache_control = __commonJS({
  'node_modules/parse-cache-control/index.js'(exports2, module2) {
    module2.exports = function parseCacheControl(field) {
      if (typeof field !== 'string') {
        return null
      }
      var regex =
        /(?:^|(?:\s*\,\s*))([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)(?:\=(?:([^\x00-\x20\(\)<>@\,;\:\\"\/\[\]\?\=\{\}\x7F]+)|(?:\"((?:[^"\\]|\\.)*)\")))?/g
      var header = {}
      var err = field.replace(regex, function ($0, $1, $2, $3) {
        var value = $2 || $3
        header[$1] = value ? value.toLowerCase() : true
        return ''
      })
      if (header['max-age']) {
        try {
          var maxAge = parseInt(header['max-age'], 10)
          if (isNaN(maxAge)) {
            return null
          }
          header['max-age'] = maxAge
        } catch (err2) {}
      }
      return err ? null : header
    }
  },
})

// node_modules/http-basic/lib/cache-control-utils.js
var require_cache_control_utils = __commonJS({
  'node_modules/http-basic/lib/cache-control-utils.js'(exports2) {
    'use strict'
    exports2.__esModule = true
    var parseCacheControl = require_parse_cache_control()
    function parseCacheControlHeader(res) {
      var cacheControl = res.headers['cache-control']
      var normalisedCacheControl = typeof cacheControl === 'string' ? cacheControl.trim() : ''
      if (!cacheControl) {
        return null
      }
      return parseCacheControl(cacheControl)
    }
    var nonCaching = ['private', 'no-cache', 'no-store', 'no-transform', 'must-revalidate', 'proxy-revalidate']
    function isCacheControlCacheable(parsedCacheControl) {
      if (!parsedCacheControl) {
        return false
      }
      if (parsedCacheControl.public) {
        return true
      }
      if (parsedCacheControl['max-age']) {
        for (var i = 0; i < nonCaching.length; i++) {
          if (parsedCacheControl[nonCaching[i]]) {
            return false
          }
        }
        return true
      }
      return false
    }
    function isCacheable(res) {
      return isCacheControlCacheable(parseCacheControlHeader(res))
    }
    exports2.isCacheable = isCacheable
    function buildPolicy(parsedCacheControl) {
      return { maxage: parsedCacheControl['max-age'] || null }
    }
    function cachePolicy(res) {
      var parsed = parseCacheControlHeader(res)
      return parsed && isCacheControlCacheable(parsed) ? buildPolicy(parsed) : null
    }
    exports2.cachePolicy = cachePolicy
  },
})

// node_modules/http-basic/lib/cache-utils.js
var require_cache_utils = __commonJS({
  'node_modules/http-basic/lib/cache-utils.js'(exports2) {
    'use strict'
    exports2.__esModule = true
    var cache_control_utils_1 = require_cache_control_utils()
    function isMatch(requestHeaders, cachedResponse) {
      var vary = cachedResponse.headers['vary']
      if (vary && cachedResponse.requestHeaders) {
        vary = '' + vary
        return vary
          .split(',')
          .map(function (header) {
            return header.trim().toLowerCase()
          })
          .every(function (header) {
            return requestHeaders[header] === cachedResponse.requestHeaders[header]
          })
      } else {
        return true
      }
    }
    exports2.isMatch = isMatch
    function isExpired(cachedResponse) {
      var policy = cache_control_utils_1.cachePolicy(cachedResponse)
      if (policy) {
        var time = (Date.now() - cachedResponse.requestTimestamp) / 1e3
        if (policy.maxage !== null && policy.maxage > time) {
          return false
        }
      }
      if (cachedResponse.statusCode === 301 || cachedResponse.statusCode === 308) return false
      return true
    }
    exports2.isExpired = isExpired
    function canCache(res) {
      if (res.headers['etag']) return true
      if (res.headers['last-modified']) return true
      if (cache_control_utils_1.isCacheable(res)) return true
      if (res.statusCode === 301 || res.statusCode === 308) return true
      return false
    }
    exports2.canCache = canCache
  },
})

// node_modules/http-basic/lib/FileCache.js
var require_FileCache = __commonJS({
  'node_modules/http-basic/lib/FileCache.js'(exports2) {
    'use strict'
    exports2.__esModule = true
    var fs = require('fs')
    var path_1 = require('path')
    var crypto_1 = require('crypto')
    function jsonParse(data, cb) {
      var result = null
      try {
        result = JSON.parse(data)
      } catch (ex) {
        return cb(ex)
      }
      cb(null, result)
    }
    function getCacheKey(url) {
      var hash = crypto_1.createHash('sha512')
      hash.update(url)
      return hash.digest('hex')
    }
    var FileCache = (function () {
      function FileCache2(location) {
        this._location = location
      }
      FileCache2.prototype.getResponse = function (url, callback) {
        var key = path_1.resolve(this._location, getCacheKey(url))
        fs.readFile(key + '.json', 'utf8', function (err, data) {
          if (err && err.code === 'ENOENT') return callback(null, null)
          else if (err) return callback(err, null)
          jsonParse(data, function (err2, response) {
            if (err2) {
              return callback(err2, null)
            }
            var body = fs.createReadStream(key + '.body')
            response.body = body
            callback(null, response)
          })
        })
      }
      FileCache2.prototype.setResponse = function (url, response) {
        var key = path_1.resolve(this._location, getCacheKey(url))
        var errored = false
        fs.mkdir(this._location, function (err) {
          if (err && err.code !== 'EEXIST') {
            console.warn('Error creating cache: ' + err.message)
            return
          }
          response.body
            .pipe(fs.createWriteStream(key + '.body'))
            .on('error', function (err2) {
              errored = true
              console.warn('Error writing to cache: ' + err2.message)
            })
            .on('close', function () {
              if (!errored) {
                fs.writeFile(
                  key + '.json',
                  JSON.stringify(
                    {
                      statusCode: response.statusCode,
                      headers: response.headers,
                      requestHeaders: response.requestHeaders,
                      requestTimestamp: response.requestTimestamp,
                    },
                    null,
                    '  ',
                  ),
                  function (err2) {
                    if (err2) {
                      console.warn('Error writing to cache: ' + err2.message)
                    }
                  },
                )
              }
            })
        })
      }
      FileCache2.prototype.updateResponseHeaders = function (url, response) {
        var key = path_1.resolve(this._location, getCacheKey(url))
        fs.readFile(key + '.json', 'utf8', function (err, data) {
          if (err) {
            console.warn('Error writing to cache: ' + err.message)
            return
          }
          var parsed = null
          try {
            parsed = JSON.parse(data)
          } catch (ex) {
            console.warn('Error writing to cache: ' + ex.message)
            return
          }
          fs.writeFile(
            key + '.json',
            JSON.stringify(
              {
                statusCode: parsed.statusCode,
                headers: response.headers,
                requestHeaders: parsed.requestHeaders,
                requestTimestamp: response.requestTimestamp,
              },
              null,
              '  ',
            ),
            function (err2) {
              if (err2) {
                console.warn('Error writing to cache: ' + err2.message)
              }
            },
          )
        })
      }
      FileCache2.prototype.invalidateResponse = function (url, callback) {
        var key = path_1.resolve(this._location, getCacheKey(url))
        fs.unlink(key + '.json', function (err) {
          if (err && err.code === 'ENOENT') return callback(null)
          else callback(err || null)
        })
      }
      return FileCache2
    })()
    exports2['default'] = FileCache
  },
})

// node_modules/http-basic/lib/MemoryCache.js
var require_MemoryCache = __commonJS({
  'node_modules/http-basic/lib/MemoryCache.js'(exports2) {
    'use strict'
    var __assign =
      (exports2 && exports2.__assign) ||
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    exports2.__esModule = true
    var stream_1 = require('stream')
    var concat = require_concat_stream()
    var MemoryCache = (function () {
      function MemoryCache2() {
        this._cache = {}
      }
      MemoryCache2.prototype.getResponse = function (url, callback) {
        var cache = this._cache
        if (cache[url]) {
          var body = new stream_1.PassThrough()
          body.end(cache[url].body)
          callback(null, {
            statusCode: cache[url].statusCode,
            headers: cache[url].headers,
            body,
            requestHeaders: cache[url].requestHeaders,
            requestTimestamp: cache[url].requestTimestamp,
          })
        } else {
          callback(null, null)
        }
      }
      MemoryCache2.prototype.updateResponseHeaders = function (url, response) {
        this._cache[url] = __assign({}, this._cache[url], {
          headers: response.headers,
          requestTimestamp: response.requestTimestamp,
        })
      }
      MemoryCache2.prototype.setResponse = function (url, response) {
        var cache = this._cache
        response.body.pipe(
          concat(function (body) {
            cache[url] = {
              statusCode: response.statusCode,
              headers: response.headers,
              body,
              requestHeaders: response.requestHeaders,
              requestTimestamp: response.requestTimestamp,
            }
          }),
        )
      }
      MemoryCache2.prototype.invalidateResponse = function (url, callback) {
        var cache = this._cache
        delete cache[url]
        callback(null)
      }
      return MemoryCache2
    })()
    exports2['default'] = MemoryCache
  },
})

// node_modules/caseless/index.js
var require_caseless = __commonJS({
  'node_modules/caseless/index.js'(exports2, module2) {
    function Caseless(dict) {
      this.dict = dict || {}
    }
    Caseless.prototype.set = function (name, value, clobber) {
      if (typeof name === 'object') {
        for (var i in name) {
          this.set(i, name[i], value)
        }
      } else {
        if (typeof clobber === 'undefined') clobber = true
        var has = this.has(name)
        if (!clobber && has) this.dict[has] = this.dict[has] + ',' + value
        else this.dict[has || name] = value
        return has
      }
    }
    Caseless.prototype.has = function (name) {
      var keys = Object.keys(this.dict),
        name = name.toLowerCase()
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].toLowerCase() === name) return keys[i]
      }
      return false
    }
    Caseless.prototype.get = function (name) {
      name = name.toLowerCase()
      var result, _key
      var headers = this.dict
      Object.keys(headers).forEach(function (key) {
        _key = key.toLowerCase()
        if (name === _key) result = headers[key]
      })
      return result
    }
    Caseless.prototype.swap = function (name) {
      var has = this.has(name)
      if (has === name) return
      if (!has) throw new Error('There is no header than matches "' + name + '"')
      this.dict[name] = this.dict[has]
      delete this.dict[has]
    }
    Caseless.prototype.del = function (name) {
      var has = this.has(name)
      return delete this.dict[has || name]
    }
    module2.exports = function (dict) {
      return new Caseless(dict)
    }
    module2.exports.httpify = function (resp, headers) {
      var c = new Caseless(headers)
      resp.setHeader = function (key, value, clobber) {
        if (typeof value === 'undefined') return
        return c.set(key, value, clobber)
      }
      resp.hasHeader = function (key) {
        return c.has(key)
      }
      resp.getHeader = function (key) {
        return c.get(key)
      }
      resp.removeHeader = function (key) {
        return c.del(key)
      }
      resp.headers = c.dict
      return c
    }
  },
})

// node_modules/http-basic/lib/index.js
var require_lib5 = __commonJS({
  'node_modules/http-basic/lib/index.js'(exports2, module2) {
    'use strict'
    var __assign =
      (exports2 && exports2.__assign) ||
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    exports2.__esModule = true
    var cacheUtils = require_cache_utils()
    var FileCache_1 = require_FileCache()
    var MemoryCache_1 = require_MemoryCache()
    var http_1 = require('http')
    var zlib_1 = require('zlib')
    var url_1 = require('url')
    var stream_1 = require('stream')
    var https_1 = require('https')
    var Response = require_lib2()
    exports2.Response = Response
    var caseless = require_caseless()
    var fileCache = new FileCache_1['default'](__dirname + '/cache')
    var memoryCache = new MemoryCache_1['default']()
    function requestProtocol(protocol, options, callback) {
      if (protocol === 'http') {
        return http_1.request(options, callback)
      } else if (protocol === 'https') {
        return https_1.request(options, callback)
      }
      throw new Error('Unsupported protocol ' + protocol)
    }
    function request(method, url, options, callback) {
      if (typeof options === 'function') {
        callback = options
        options = null
      }
      if (options === null || options === void 0) {
        options = {}
      }
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object (or null)')
      }
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function')
      }
      return _request(method, url && typeof url === 'object' ? url.href : url, options, callback)
    }
    function _request(method, url, options, callback) {
      var start = Date.now()
      if (typeof method !== 'string') {
        throw new TypeError('The method must be a string.')
      }
      if (typeof url !== 'string') {
        throw new TypeError('The URL/path must be a string or a URL object.')
      }
      method = method.toUpperCase()
      var urlObject = url_1.parse(url)
      var protocol = (urlObject.protocol || '').replace(/\:$/, '')
      if (protocol !== 'http' && protocol !== 'https') {
        throw new TypeError('The protocol "' + protocol + '" is not supported, cannot load "' + url + '"')
      }
      var rawHeaders = options.headers || {}
      var headers = caseless(rawHeaders)
      if (urlObject.auth) {
        headers.set('Authorization', 'Basic ' + Buffer.from(urlObject.auth).toString('base64'))
      }
      var agent = 'agent' in options ? options.agent : false
      var cache = options.cache
      if (typeof cache === 'string') {
        if (cache === 'file') {
          cache = fileCache
        } else if (cache === 'memory') {
          cache = memoryCache
        }
      }
      if (
        cache &&
        !(
          typeof cache === 'object' &&
          typeof cache.getResponse === 'function' &&
          typeof cache.setResponse === 'function' &&
          typeof cache.invalidateResponse === 'function'
        )
      ) {
        throw new TypeError(
          cache +
            ' is not a valid cache, caches must have `getResponse`, `setResponse` and `invalidateResponse` methods.',
        )
      }
      var ignoreFailedInvalidation = options.ignoreFailedInvalidation
      if (options.duplex !== void 0 && typeof options.duplex !== 'boolean') {
        throw new Error('expected options.duplex to be a boolean if provided')
      }
      var duplex =
        options.duplex !== void 0 ? options.duplex : !(method === 'GET' || method === 'DELETE' || method === 'HEAD')
      var unsafe = !(method === 'GET' || method === 'OPTIONS' || method === 'HEAD')
      if (options.gzip) {
        headers.set(
          'Accept-Encoding',
          headers.has('Accept-Encoding') ? headers.get('Accept-Encoding') + ',gzip,deflate' : 'gzip,deflate',
        )
        return _request(
          method,
          url,
          {
            allowRedirectHeaders: options.allowRedirectHeaders,
            duplex,
            headers: rawHeaders,
            agent,
            followRedirects: options.followRedirects,
            retry: options.retry,
            retryDelay: options.retryDelay,
            maxRetries: options.maxRetries,
            cache,
            timeout: options.timeout,
          },
          function (err, res) {
            if (err) return callback(err)
            if (!res) return callback(new Error('Response should not be undefined if there is no error.'))
            var newHeaders = __assign({}, res.headers)
            var newBody = res.body
            switch (newHeaders['content-encoding']) {
              case 'gzip':
                delete newHeaders['content-encoding']
                newBody = res.body.pipe(zlib_1.createGunzip())
                break
              case 'deflate':
                delete newHeaders['content-encoding']
                newBody = res.body.pipe(zlib_1.createInflate())
                break
            }
            return callback(err, new Response(res.statusCode, newHeaders, newBody, res.url))
          },
        )
      }
      if (options.followRedirects) {
        return _request(
          method,
          url,
          {
            allowRedirectHeaders: options.allowRedirectHeaders,
            duplex,
            headers: rawHeaders,
            agent,
            retry: options.retry,
            retryDelay: options.retryDelay,
            maxRetries: options.maxRetries,
            cache,
            timeout: options.timeout,
          },
          function (err, res) {
            if (err) return callback(err)
            if (!res) return callback(new Error('Response should not be undefined if there is no error.'))
            if (options.followRedirects && isRedirect(res.statusCode)) {
              res.body.resume()
              if (method === 'DELETE' && res.statusCode === 303) {
                method = 'GET'
              }
              if (options.maxRedirects === 0) {
                var err_1 = new Error('Maximum number of redirects exceeded')
                err_1.res = res
                return callback(err_1, res)
              }
              options = __assign({}, options, {
                duplex: false,
                maxRedirects:
                  options.maxRedirects && options.maxRedirects !== Infinity
                    ? options.maxRedirects - 1
                    : options.maxRedirects,
              })
              var headers_1 = caseless(options.headers)
              var redirectHeaders = {}
              if (options.allowRedirectHeaders) {
                for (var i = 0; i < options.allowRedirectHeaders.length; i++) {
                  var headerName = options.allowRedirectHeaders[i]
                  var headerValue = headers_1.get(headerName)
                  if (headerValue) {
                    redirectHeaders[headerName] = headerValue
                  }
                }
              }
              options.headers = redirectHeaders
              var location = res.headers.location
              if (typeof location !== 'string') {
                return callback(new Error('Cannot redirect to non string location: ' + location))
              }
              return request(duplex ? 'GET' : method, url_1.resolve(url, location), options, callback)
            } else {
              return callback(null, res)
            }
          },
        )
      }
      if (cache && method === 'GET' && !duplex) {
        var timestamp_1 = Date.now()
        return cache.getResponse(url, function (err, cachedResponse) {
          if (err) {
            console.warn('Error reading from cache: ' + err.message)
          }
          var isMatch = !!(cachedResponse && cacheUtils.isMatch(rawHeaders, cachedResponse))
          if (cachedResponse && (options.isMatch ? options.isMatch(rawHeaders, cachedResponse, isMatch) : isMatch)) {
            var isExpired = cacheUtils.isExpired(cachedResponse)
            if (!(options.isExpired ? options.isExpired(cachedResponse, isExpired) : isExpired)) {
              var res = new Response(cachedResponse.statusCode, cachedResponse.headers, cachedResponse.body, url)
              res.fromCache = true
              res.fromNotModified = false
              return callback(null, res)
            } else {
              if (cachedResponse.headers['etag']) {
                headers.set('If-None-Match', cachedResponse.headers['etag'])
              }
              if (cachedResponse.headers['last-modified']) {
                headers.set('If-Modified-Since', cachedResponse.headers['last-modified'])
              }
            }
          }
          request(
            'GET',
            url,
            {
              allowRedirectHeaders: options.allowRedirectHeaders,
              headers: rawHeaders,
              retry: options.retry,
              retryDelay: options.retryDelay,
              maxRetries: options.maxRetries,
              agent,
              timeout: options.timeout,
            },
            function (err2, res2) {
              if (err2) return callback(err2)
              if (!res2) return callback(new Error('Response should not be undefined if there is no error.'))
              if (res2.statusCode === 304 && cachedResponse) {
                res2.body.resume()
                var resultBody = cachedResponse.body
                var c = cache
                if (c.updateResponseHeaders) {
                  c.updateResponseHeaders(url, {
                    headers: res2.headers,
                    requestTimestamp: timestamp_1,
                  })
                } else {
                  var cachedResponseBody_1 = new stream_1.PassThrough()
                  var newResultBody_1 = new stream_1.PassThrough()
                  resultBody.on('data', function (data) {
                    cachedResponseBody_1.write(data)
                    newResultBody_1.write(data)
                  })
                  resultBody.on('end', function () {
                    cachedResponseBody_1.end()
                    newResultBody_1.end()
                  })
                  resultBody = newResultBody_1
                  cache.setResponse(url, {
                    statusCode: cachedResponse.statusCode,
                    headers: res2.headers,
                    body: cachedResponseBody_1,
                    requestHeaders: cachedResponse.requestHeaders,
                    requestTimestamp: timestamp_1,
                  })
                }
                var response = new Response(cachedResponse.statusCode, cachedResponse.headers, resultBody, url)
                response.fromCache = true
                response.fromNotModified = true
                return callback(null, response)
              }
              cachedResponse && cachedResponse.body.resume()
              var canCache = cacheUtils.canCache(res2)
              if (options.canCache ? options.canCache(res2, canCache) : canCache) {
                var cachedResponseBody_2 = new stream_1.PassThrough()
                var resultResponseBody_1 = new stream_1.PassThrough()
                res2.body.on('data', function (data) {
                  cachedResponseBody_2.write(data)
                  resultResponseBody_1.write(data)
                })
                res2.body.on('end', function () {
                  cachedResponseBody_2.end()
                  resultResponseBody_1.end()
                })
                var resultResponse = new Response(res2.statusCode, res2.headers, resultResponseBody_1, url)
                cache.setResponse(url, {
                  statusCode: res2.statusCode,
                  headers: res2.headers,
                  body: cachedResponseBody_2,
                  requestHeaders: rawHeaders,
                  requestTimestamp: timestamp_1,
                })
                return callback(null, resultResponse)
              } else {
                return callback(null, res2)
              }
            },
          )
        })
      }
      function attempt(n) {
        return _request(
          method,
          url,
          {
            allowRedirectHeaders: options.allowRedirectHeaders,
            headers: rawHeaders,
            agent,
            timeout: options.timeout,
          },
          function (err, res) {
            var retry = err || !res || res.statusCode >= 400
            if (typeof options.retry === 'function') {
              retry = options.retry(err, res, n + 1)
            }
            if (n >= (options.maxRetries || 5)) {
              retry = false
            }
            if (retry) {
              var delay = options.retryDelay
              if (typeof delay === 'function') {
                delay = delay(err, res, n + 1)
              }
              delay = delay || 200
              setTimeout(function () {
                attempt(n + 1)
              }, delay)
            } else {
              callback(err, res)
            }
          },
        )
      }
      if (options.retry && method === 'GET' && !duplex) {
        return attempt(0)
      }
      var responded = false
      var timeout = null
      var req = requestProtocol(
        protocol,
        {
          host: urlObject.hostname,
          port: urlObject.port == null ? void 0 : +urlObject.port,
          path: urlObject.path,
          method,
          headers: rawHeaders,
          agent,
        },
        function (res) {
          var end = Date.now()
          if (responded) return res.resume()
          responded = true
          if (timeout !== null) clearTimeout(timeout)
          var result = new Response(res.statusCode || 0, res.headers, res, url)
          if (cache && unsafe && res.statusCode && res.statusCode < 400) {
            cache.invalidateResponse(url, function (err) {
              if (err && !ignoreFailedInvalidation) {
                callback(new Error('Error invalidating the cache for' + url + ': ' + err.message), result)
              } else {
                callback(null, result)
              }
            })
          } else {
            callback(null, result)
          }
        },
      ).on('error', function (err) {
        if (responded) return
        responded = true
        if (timeout !== null) clearTimeout(timeout)
        callback(err)
      })
      function onTimeout() {
        if (responded) return
        responded = true
        if (timeout !== null) clearTimeout(timeout)
        req.abort()
        var duration = Date.now() - start
        var err = new Error('Request timed out after ' + duration + 'ms')
        err.timeout = true
        err.duration = duration
        callback(err)
      }
      if (options.socketTimeout) {
        req.setTimeout(options.socketTimeout, onTimeout)
      }
      if (options.timeout) {
        timeout = setTimeout(onTimeout, options.timeout)
      }
      if (duplex) {
        return req
      } else {
        req.end()
      }
      return void 0
    }
    function isRedirect(statusCode) {
      return statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308
    }
    exports2['default'] = request
    module2.exports = request
    module2.exports['default'] = request
    module2.exports.Response = Response
  },
})

// node_modules/delayed-stream/lib/delayed_stream.js
var require_delayed_stream = __commonJS({
  'node_modules/delayed-stream/lib/delayed_stream.js'(exports2, module2) {
    var Stream = require('stream').Stream
    var util = require('util')
    module2.exports = DelayedStream
    function DelayedStream() {
      this.source = null
      this.dataSize = 0
      this.maxDataSize = 1024 * 1024
      this.pauseStream = true
      this._maxDataSizeExceeded = false
      this._released = false
      this._bufferedEvents = []
    }
    util.inherits(DelayedStream, Stream)
    DelayedStream.create = function (source, options) {
      var delayedStream = new this()
      options = options || {}
      for (var option in options) {
        delayedStream[option] = options[option]
      }
      delayedStream.source = source
      var realEmit = source.emit
      source.emit = function () {
        delayedStream._handleEmit(arguments)
        return realEmit.apply(source, arguments)
      }
      source.on('error', function () {})
      if (delayedStream.pauseStream) {
        source.pause()
      }
      return delayedStream
    }
    Object.defineProperty(DelayedStream.prototype, 'readable', {
      configurable: true,
      enumerable: true,
      get: function () {
        return this.source.readable
      },
    })
    DelayedStream.prototype.setEncoding = function () {
      return this.source.setEncoding.apply(this.source, arguments)
    }
    DelayedStream.prototype.resume = function () {
      if (!this._released) {
        this.release()
      }
      this.source.resume()
    }
    DelayedStream.prototype.pause = function () {
      this.source.pause()
    }
    DelayedStream.prototype.release = function () {
      this._released = true
      this._bufferedEvents.forEach(
        function (args) {
          this.emit.apply(this, args)
        }.bind(this),
      )
      this._bufferedEvents = []
    }
    DelayedStream.prototype.pipe = function () {
      var r = Stream.prototype.pipe.apply(this, arguments)
      this.resume()
      return r
    }
    DelayedStream.prototype._handleEmit = function (args) {
      if (this._released) {
        this.emit.apply(this, args)
        return
      }
      if (args[0] === 'data') {
        this.dataSize += args[1].length
        this._checkIfMaxDataSizeExceeded()
      }
      this._bufferedEvents.push(args)
    }
    DelayedStream.prototype._checkIfMaxDataSizeExceeded = function () {
      if (this._maxDataSizeExceeded) {
        return
      }
      if (this.dataSize <= this.maxDataSize) {
        return
      }
      this._maxDataSizeExceeded = true
      var message = 'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.'
      this.emit('error', new Error(message))
    }
  },
})

// node_modules/combined-stream/lib/combined_stream.js
var require_combined_stream = __commonJS({
  'node_modules/combined-stream/lib/combined_stream.js'(exports2, module2) {
    var util = require('util')
    var Stream = require('stream').Stream
    var DelayedStream = require_delayed_stream()
    module2.exports = CombinedStream
    function CombinedStream() {
      this.writable = false
      this.readable = true
      this.dataSize = 0
      this.maxDataSize = 2 * 1024 * 1024
      this.pauseStreams = true
      this._released = false
      this._streams = []
      this._currentStream = null
      this._insideLoop = false
      this._pendingNext = false
    }
    util.inherits(CombinedStream, Stream)
    CombinedStream.create = function (options) {
      var combinedStream = new this()
      options = options || {}
      for (var option in options) {
        combinedStream[option] = options[option]
      }
      return combinedStream
    }
    CombinedStream.isStreamLike = function (stream) {
      return (
        typeof stream !== 'function' &&
        typeof stream !== 'string' &&
        typeof stream !== 'boolean' &&
        typeof stream !== 'number' &&
        !Buffer.isBuffer(stream)
      )
    }
    CombinedStream.prototype.append = function (stream) {
      var isStreamLike = CombinedStream.isStreamLike(stream)
      if (isStreamLike) {
        if (!(stream instanceof DelayedStream)) {
          var newStream = DelayedStream.create(stream, {
            maxDataSize: Infinity,
            pauseStream: this.pauseStreams,
          })
          stream.on('data', this._checkDataSize.bind(this))
          stream = newStream
        }
        this._handleErrors(stream)
        if (this.pauseStreams) {
          stream.pause()
        }
      }
      this._streams.push(stream)
      return this
    }
    CombinedStream.prototype.pipe = function (dest, options) {
      Stream.prototype.pipe.call(this, dest, options)
      this.resume()
      return dest
    }
    CombinedStream.prototype._getNext = function () {
      this._currentStream = null
      if (this._insideLoop) {
        this._pendingNext = true
        return
      }
      this._insideLoop = true
      try {
        do {
          this._pendingNext = false
          this._realGetNext()
        } while (this._pendingNext)
      } finally {
        this._insideLoop = false
      }
    }
    CombinedStream.prototype._realGetNext = function () {
      var stream = this._streams.shift()
      if (typeof stream == 'undefined') {
        this.end()
        return
      }
      if (typeof stream !== 'function') {
        this._pipeNext(stream)
        return
      }
      var getStream = stream
      getStream(
        function (stream2) {
          var isStreamLike = CombinedStream.isStreamLike(stream2)
          if (isStreamLike) {
            stream2.on('data', this._checkDataSize.bind(this))
            this._handleErrors(stream2)
          }
          this._pipeNext(stream2)
        }.bind(this),
      )
    }
    CombinedStream.prototype._pipeNext = function (stream) {
      this._currentStream = stream
      var isStreamLike = CombinedStream.isStreamLike(stream)
      if (isStreamLike) {
        stream.on('end', this._getNext.bind(this))
        stream.pipe(this, { end: false })
        return
      }
      var value = stream
      this.write(value)
      this._getNext()
    }
    CombinedStream.prototype._handleErrors = function (stream) {
      var self2 = this
      stream.on('error', function (err) {
        self2._emitError(err)
      })
    }
    CombinedStream.prototype.write = function (data) {
      this.emit('data', data)
    }
    CombinedStream.prototype.pause = function () {
      if (!this.pauseStreams) {
        return
      }
      if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == 'function')
        this._currentStream.pause()
      this.emit('pause')
    }
    CombinedStream.prototype.resume = function () {
      if (!this._released) {
        this._released = true
        this.writable = true
        this._getNext()
      }
      if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == 'function')
        this._currentStream.resume()
      this.emit('resume')
    }
    CombinedStream.prototype.end = function () {
      this._reset()
      this.emit('end')
    }
    CombinedStream.prototype.destroy = function () {
      this._reset()
      this.emit('close')
    }
    CombinedStream.prototype._reset = function () {
      this.writable = false
      this._streams = []
      this._currentStream = null
    }
    CombinedStream.prototype._checkDataSize = function () {
      this._updateDataSize()
      if (this.dataSize <= this.maxDataSize) {
        return
      }
      var message = 'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.'
      this._emitError(new Error(message))
    }
    CombinedStream.prototype._updateDataSize = function () {
      this.dataSize = 0
      var self2 = this
      this._streams.forEach(function (stream) {
        if (!stream.dataSize) {
          return
        }
        self2.dataSize += stream.dataSize
      })
      if (this._currentStream && this._currentStream.dataSize) {
        this.dataSize += this._currentStream.dataSize
      }
    }
    CombinedStream.prototype._emitError = function (err) {
      this._reset()
      this.emit('error', err)
    }
  },
})

// node_modules/mime-db/db.json
var require_db = __commonJS({
  'node_modules/mime-db/db.json'(exports2, module2) {
    module2.exports = {
      'application/1d-interleaved-parityfec': {
        source: 'iana',
      },
      'application/3gpdash-qoe-report+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/3gpp-ims+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/a2l': {
        source: 'iana',
      },
      'application/activemessage': {
        source: 'iana',
      },
      'application/activity+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-costmap+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-costmapfilter+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-directory+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-endpointcost+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-endpointcostparams+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-endpointprop+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-endpointpropparams+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-error+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-networkmap+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-networkmapfilter+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-updatestreamcontrol+json': {
        source: 'iana',
        compressible: true,
      },
      'application/alto-updatestreamparams+json': {
        source: 'iana',
        compressible: true,
      },
      'application/aml': {
        source: 'iana',
      },
      'application/andrew-inset': {
        source: 'iana',
        extensions: ['ez'],
      },
      'application/applefile': {
        source: 'iana',
      },
      'application/applixware': {
        source: 'apache',
        extensions: ['aw'],
      },
      'application/atf': {
        source: 'iana',
      },
      'application/atfx': {
        source: 'iana',
      },
      'application/atom+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['atom'],
      },
      'application/atomcat+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['atomcat'],
      },
      'application/atomdeleted+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['atomdeleted'],
      },
      'application/atomicmail': {
        source: 'iana',
      },
      'application/atomsvc+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['atomsvc'],
      },
      'application/atsc-dwd+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['dwd'],
      },
      'application/atsc-dynamic-event-message': {
        source: 'iana',
      },
      'application/atsc-held+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['held'],
      },
      'application/atsc-rdt+json': {
        source: 'iana',
        compressible: true,
      },
      'application/atsc-rsat+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['rsat'],
      },
      'application/atxml': {
        source: 'iana',
      },
      'application/auth-policy+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/bacnet-xdd+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/batch-smtp': {
        source: 'iana',
      },
      'application/bdoc': {
        compressible: false,
        extensions: ['bdoc'],
      },
      'application/beep+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/calendar+json': {
        source: 'iana',
        compressible: true,
      },
      'application/calendar+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xcs'],
      },
      'application/call-completion': {
        source: 'iana',
      },
      'application/cals-1840': {
        source: 'iana',
      },
      'application/captive+json': {
        source: 'iana',
        compressible: true,
      },
      'application/cbor': {
        source: 'iana',
      },
      'application/cbor-seq': {
        source: 'iana',
      },
      'application/cccex': {
        source: 'iana',
      },
      'application/ccmp+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/ccxml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['ccxml'],
      },
      'application/cdfx+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['cdfx'],
      },
      'application/cdmi-capability': {
        source: 'iana',
        extensions: ['cdmia'],
      },
      'application/cdmi-container': {
        source: 'iana',
        extensions: ['cdmic'],
      },
      'application/cdmi-domain': {
        source: 'iana',
        extensions: ['cdmid'],
      },
      'application/cdmi-object': {
        source: 'iana',
        extensions: ['cdmio'],
      },
      'application/cdmi-queue': {
        source: 'iana',
        extensions: ['cdmiq'],
      },
      'application/cdni': {
        source: 'iana',
      },
      'application/cea': {
        source: 'iana',
      },
      'application/cea-2018+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/cellml+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/cfw': {
        source: 'iana',
      },
      'application/clr': {
        source: 'iana',
      },
      'application/clue+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/clue_info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/cms': {
        source: 'iana',
      },
      'application/cnrp+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/coap-group+json': {
        source: 'iana',
        compressible: true,
      },
      'application/coap-payload': {
        source: 'iana',
      },
      'application/commonground': {
        source: 'iana',
      },
      'application/conference-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/cose': {
        source: 'iana',
      },
      'application/cose-key': {
        source: 'iana',
      },
      'application/cose-key-set': {
        source: 'iana',
      },
      'application/cpl+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/csrattrs': {
        source: 'iana',
      },
      'application/csta+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/cstadata+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/csvm+json': {
        source: 'iana',
        compressible: true,
      },
      'application/cu-seeme': {
        source: 'apache',
        extensions: ['cu'],
      },
      'application/cwt': {
        source: 'iana',
      },
      'application/cybercash': {
        source: 'iana',
      },
      'application/dart': {
        compressible: true,
      },
      'application/dash+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['mpd'],
      },
      'application/dashdelta': {
        source: 'iana',
      },
      'application/davmount+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['davmount'],
      },
      'application/dca-rft': {
        source: 'iana',
      },
      'application/dcd': {
        source: 'iana',
      },
      'application/dec-dx': {
        source: 'iana',
      },
      'application/dialog-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/dicom': {
        source: 'iana',
      },
      'application/dicom+json': {
        source: 'iana',
        compressible: true,
      },
      'application/dicom+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/dii': {
        source: 'iana',
      },
      'application/dit': {
        source: 'iana',
      },
      'application/dns': {
        source: 'iana',
      },
      'application/dns+json': {
        source: 'iana',
        compressible: true,
      },
      'application/dns-message': {
        source: 'iana',
      },
      'application/docbook+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['dbk'],
      },
      'application/dots+cbor': {
        source: 'iana',
      },
      'application/dskpp+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/dssc+der': {
        source: 'iana',
        extensions: ['dssc'],
      },
      'application/dssc+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xdssc'],
      },
      'application/dvcs': {
        source: 'iana',
      },
      'application/ecmascript': {
        source: 'iana',
        compressible: true,
        extensions: ['es', 'ecma'],
      },
      'application/edi-consent': {
        source: 'iana',
      },
      'application/edi-x12': {
        source: 'iana',
        compressible: false,
      },
      'application/edifact': {
        source: 'iana',
        compressible: false,
      },
      'application/efi': {
        source: 'iana',
      },
      'application/elm+json': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/elm+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/emergencycalldata.cap+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/emergencycalldata.comment+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/emergencycalldata.control+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/emergencycalldata.deviceinfo+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/emergencycalldata.ecall.msd': {
        source: 'iana',
      },
      'application/emergencycalldata.providerinfo+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/emergencycalldata.serviceinfo+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/emergencycalldata.subscriberinfo+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/emergencycalldata.veds+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/emma+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['emma'],
      },
      'application/emotionml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['emotionml'],
      },
      'application/encaprtp': {
        source: 'iana',
      },
      'application/epp+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/epub+zip': {
        source: 'iana',
        compressible: false,
        extensions: ['epub'],
      },
      'application/eshop': {
        source: 'iana',
      },
      'application/exi': {
        source: 'iana',
        extensions: ['exi'],
      },
      'application/expect-ct-report+json': {
        source: 'iana',
        compressible: true,
      },
      'application/fastinfoset': {
        source: 'iana',
      },
      'application/fastsoap': {
        source: 'iana',
      },
      'application/fdt+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['fdt'],
      },
      'application/fhir+json': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/fhir+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/fido.trusted-apps+json': {
        compressible: true,
      },
      'application/fits': {
        source: 'iana',
      },
      'application/flexfec': {
        source: 'iana',
      },
      'application/font-sfnt': {
        source: 'iana',
      },
      'application/font-tdpfr': {
        source: 'iana',
        extensions: ['pfr'],
      },
      'application/font-woff': {
        source: 'iana',
        compressible: false,
      },
      'application/framework-attributes+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/geo+json': {
        source: 'iana',
        compressible: true,
        extensions: ['geojson'],
      },
      'application/geo+json-seq': {
        source: 'iana',
      },
      'application/geopackage+sqlite3': {
        source: 'iana',
      },
      'application/geoxacml+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/gltf-buffer': {
        source: 'iana',
      },
      'application/gml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['gml'],
      },
      'application/gpx+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['gpx'],
      },
      'application/gxf': {
        source: 'apache',
        extensions: ['gxf'],
      },
      'application/gzip': {
        source: 'iana',
        compressible: false,
        extensions: ['gz'],
      },
      'application/h224': {
        source: 'iana',
      },
      'application/held+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/hjson': {
        extensions: ['hjson'],
      },
      'application/http': {
        source: 'iana',
      },
      'application/hyperstudio': {
        source: 'iana',
        extensions: ['stk'],
      },
      'application/ibe-key-request+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/ibe-pkg-reply+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/ibe-pp-data': {
        source: 'iana',
      },
      'application/iges': {
        source: 'iana',
      },
      'application/im-iscomposing+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/index': {
        source: 'iana',
      },
      'application/index.cmd': {
        source: 'iana',
      },
      'application/index.obj': {
        source: 'iana',
      },
      'application/index.response': {
        source: 'iana',
      },
      'application/index.vnd': {
        source: 'iana',
      },
      'application/inkml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['ink', 'inkml'],
      },
      'application/iotp': {
        source: 'iana',
      },
      'application/ipfix': {
        source: 'iana',
        extensions: ['ipfix'],
      },
      'application/ipp': {
        source: 'iana',
      },
      'application/isup': {
        source: 'iana',
      },
      'application/its+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['its'],
      },
      'application/java-archive': {
        source: 'apache',
        compressible: false,
        extensions: ['jar', 'war', 'ear'],
      },
      'application/java-serialized-object': {
        source: 'apache',
        compressible: false,
        extensions: ['ser'],
      },
      'application/java-vm': {
        source: 'apache',
        compressible: false,
        extensions: ['class'],
      },
      'application/javascript': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
        extensions: ['js', 'mjs'],
      },
      'application/jf2feed+json': {
        source: 'iana',
        compressible: true,
      },
      'application/jose': {
        source: 'iana',
      },
      'application/jose+json': {
        source: 'iana',
        compressible: true,
      },
      'application/jrd+json': {
        source: 'iana',
        compressible: true,
      },
      'application/jscalendar+json': {
        source: 'iana',
        compressible: true,
      },
      'application/json': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
        extensions: ['json', 'map'],
      },
      'application/json-patch+json': {
        source: 'iana',
        compressible: true,
      },
      'application/json-seq': {
        source: 'iana',
      },
      'application/json5': {
        extensions: ['json5'],
      },
      'application/jsonml+json': {
        source: 'apache',
        compressible: true,
        extensions: ['jsonml'],
      },
      'application/jwk+json': {
        source: 'iana',
        compressible: true,
      },
      'application/jwk-set+json': {
        source: 'iana',
        compressible: true,
      },
      'application/jwt': {
        source: 'iana',
      },
      'application/kpml-request+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/kpml-response+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/ld+json': {
        source: 'iana',
        compressible: true,
        extensions: ['jsonld'],
      },
      'application/lgr+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['lgr'],
      },
      'application/link-format': {
        source: 'iana',
      },
      'application/load-control+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/lost+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['lostxml'],
      },
      'application/lostsync+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/lpf+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/lxf': {
        source: 'iana',
      },
      'application/mac-binhex40': {
        source: 'iana',
        extensions: ['hqx'],
      },
      'application/mac-compactpro': {
        source: 'apache',
        extensions: ['cpt'],
      },
      'application/macwriteii': {
        source: 'iana',
      },
      'application/mads+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['mads'],
      },
      'application/manifest+json': {
        charset: 'UTF-8',
        compressible: true,
        extensions: ['webmanifest'],
      },
      'application/marc': {
        source: 'iana',
        extensions: ['mrc'],
      },
      'application/marcxml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['mrcx'],
      },
      'application/mathematica': {
        source: 'iana',
        extensions: ['ma', 'nb', 'mb'],
      },
      'application/mathml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['mathml'],
      },
      'application/mathml-content+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mathml-presentation+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-associated-procedure-description+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-deregister+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-envelope+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-msk+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-msk-response+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-protection-description+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-reception-report+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-register+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-register-response+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-schedule+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbms-user-service-description+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mbox': {
        source: 'iana',
        extensions: ['mbox'],
      },
      'application/media-policy-dataset+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/media_control+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mediaservercontrol+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['mscml'],
      },
      'application/merge-patch+json': {
        source: 'iana',
        compressible: true,
      },
      'application/metalink+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['metalink'],
      },
      'application/metalink4+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['meta4'],
      },
      'application/mets+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['mets'],
      },
      'application/mf4': {
        source: 'iana',
      },
      'application/mikey': {
        source: 'iana',
      },
      'application/mipc': {
        source: 'iana',
      },
      'application/mmt-aei+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['maei'],
      },
      'application/mmt-usd+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['musd'],
      },
      'application/mods+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['mods'],
      },
      'application/moss-keys': {
        source: 'iana',
      },
      'application/moss-signature': {
        source: 'iana',
      },
      'application/mosskey-data': {
        source: 'iana',
      },
      'application/mosskey-request': {
        source: 'iana',
      },
      'application/mp21': {
        source: 'iana',
        extensions: ['m21', 'mp21'],
      },
      'application/mp4': {
        source: 'iana',
        extensions: ['mp4s', 'm4p'],
      },
      'application/mpeg4-generic': {
        source: 'iana',
      },
      'application/mpeg4-iod': {
        source: 'iana',
      },
      'application/mpeg4-iod-xmt': {
        source: 'iana',
      },
      'application/mrb-consumer+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/mrb-publish+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/msc-ivr+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/msc-mixer+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/msword': {
        source: 'iana',
        compressible: false,
        extensions: ['doc', 'dot'],
      },
      'application/mud+json': {
        source: 'iana',
        compressible: true,
      },
      'application/multipart-core': {
        source: 'iana',
      },
      'application/mxf': {
        source: 'iana',
        extensions: ['mxf'],
      },
      'application/n-quads': {
        source: 'iana',
        extensions: ['nq'],
      },
      'application/n-triples': {
        source: 'iana',
        extensions: ['nt'],
      },
      'application/nasdata': {
        source: 'iana',
      },
      'application/news-checkgroups': {
        source: 'iana',
        charset: 'US-ASCII',
      },
      'application/news-groupinfo': {
        source: 'iana',
        charset: 'US-ASCII',
      },
      'application/news-transmission': {
        source: 'iana',
      },
      'application/nlsml+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/node': {
        source: 'iana',
        extensions: ['cjs'],
      },
      'application/nss': {
        source: 'iana',
      },
      'application/ocsp-request': {
        source: 'iana',
      },
      'application/ocsp-response': {
        source: 'iana',
      },
      'application/octet-stream': {
        source: 'iana',
        compressible: false,
        extensions: [
          'bin',
          'dms',
          'lrf',
          'mar',
          'so',
          'dist',
          'distz',
          'pkg',
          'bpk',
          'dump',
          'elc',
          'deploy',
          'exe',
          'dll',
          'deb',
          'dmg',
          'iso',
          'img',
          'msi',
          'msp',
          'msm',
          'buffer',
        ],
      },
      'application/oda': {
        source: 'iana',
        extensions: ['oda'],
      },
      'application/odm+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/odx': {
        source: 'iana',
      },
      'application/oebps-package+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['opf'],
      },
      'application/ogg': {
        source: 'iana',
        compressible: false,
        extensions: ['ogx'],
      },
      'application/omdoc+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['omdoc'],
      },
      'application/onenote': {
        source: 'apache',
        extensions: ['onetoc', 'onetoc2', 'onetmp', 'onepkg'],
      },
      'application/opc-nodeset+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/oscore': {
        source: 'iana',
      },
      'application/oxps': {
        source: 'iana',
        extensions: ['oxps'],
      },
      'application/p2p-overlay+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['relo'],
      },
      'application/parityfec': {
        source: 'iana',
      },
      'application/passport': {
        source: 'iana',
      },
      'application/patch-ops-error+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xer'],
      },
      'application/pdf': {
        source: 'iana',
        compressible: false,
        extensions: ['pdf'],
      },
      'application/pdx': {
        source: 'iana',
      },
      'application/pem-certificate-chain': {
        source: 'iana',
      },
      'application/pgp-encrypted': {
        source: 'iana',
        compressible: false,
        extensions: ['pgp'],
      },
      'application/pgp-keys': {
        source: 'iana',
      },
      'application/pgp-signature': {
        source: 'iana',
        extensions: ['asc', 'sig'],
      },
      'application/pics-rules': {
        source: 'apache',
        extensions: ['prf'],
      },
      'application/pidf+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/pidf-diff+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/pkcs10': {
        source: 'iana',
        extensions: ['p10'],
      },
      'application/pkcs12': {
        source: 'iana',
      },
      'application/pkcs7-mime': {
        source: 'iana',
        extensions: ['p7m', 'p7c'],
      },
      'application/pkcs7-signature': {
        source: 'iana',
        extensions: ['p7s'],
      },
      'application/pkcs8': {
        source: 'iana',
        extensions: ['p8'],
      },
      'application/pkcs8-encrypted': {
        source: 'iana',
      },
      'application/pkix-attr-cert': {
        source: 'iana',
        extensions: ['ac'],
      },
      'application/pkix-cert': {
        source: 'iana',
        extensions: ['cer'],
      },
      'application/pkix-crl': {
        source: 'iana',
        extensions: ['crl'],
      },
      'application/pkix-pkipath': {
        source: 'iana',
        extensions: ['pkipath'],
      },
      'application/pkixcmp': {
        source: 'iana',
        extensions: ['pki'],
      },
      'application/pls+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['pls'],
      },
      'application/poc-settings+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/postscript': {
        source: 'iana',
        compressible: true,
        extensions: ['ai', 'eps', 'ps'],
      },
      'application/ppsp-tracker+json': {
        source: 'iana',
        compressible: true,
      },
      'application/problem+json': {
        source: 'iana',
        compressible: true,
      },
      'application/problem+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/provenance+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['provx'],
      },
      'application/prs.alvestrand.titrax-sheet': {
        source: 'iana',
      },
      'application/prs.cww': {
        source: 'iana',
        extensions: ['cww'],
      },
      'application/prs.cyn': {
        source: 'iana',
        charset: '7-BIT',
      },
      'application/prs.hpub+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/prs.nprend': {
        source: 'iana',
      },
      'application/prs.plucker': {
        source: 'iana',
      },
      'application/prs.rdf-xml-crypt': {
        source: 'iana',
      },
      'application/prs.xsf+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/pskc+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['pskcxml'],
      },
      'application/pvd+json': {
        source: 'iana',
        compressible: true,
      },
      'application/qsig': {
        source: 'iana',
      },
      'application/raml+yaml': {
        compressible: true,
        extensions: ['raml'],
      },
      'application/raptorfec': {
        source: 'iana',
      },
      'application/rdap+json': {
        source: 'iana',
        compressible: true,
      },
      'application/rdf+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['rdf', 'owl'],
      },
      'application/reginfo+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['rif'],
      },
      'application/relax-ng-compact-syntax': {
        source: 'iana',
        extensions: ['rnc'],
      },
      'application/remote-printing': {
        source: 'iana',
      },
      'application/reputon+json': {
        source: 'iana',
        compressible: true,
      },
      'application/resource-lists+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['rl'],
      },
      'application/resource-lists-diff+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['rld'],
      },
      'application/rfc+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/riscos': {
        source: 'iana',
      },
      'application/rlmi+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/rls-services+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['rs'],
      },
      'application/route-apd+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['rapd'],
      },
      'application/route-s-tsid+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['sls'],
      },
      'application/route-usd+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['rusd'],
      },
      'application/rpki-ghostbusters': {
        source: 'iana',
        extensions: ['gbr'],
      },
      'application/rpki-manifest': {
        source: 'iana',
        extensions: ['mft'],
      },
      'application/rpki-publication': {
        source: 'iana',
      },
      'application/rpki-roa': {
        source: 'iana',
        extensions: ['roa'],
      },
      'application/rpki-updown': {
        source: 'iana',
      },
      'application/rsd+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['rsd'],
      },
      'application/rss+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['rss'],
      },
      'application/rtf': {
        source: 'iana',
        compressible: true,
        extensions: ['rtf'],
      },
      'application/rtploopback': {
        source: 'iana',
      },
      'application/rtx': {
        source: 'iana',
      },
      'application/samlassertion+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/samlmetadata+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/sarif+json': {
        source: 'iana',
        compressible: true,
      },
      'application/sbe': {
        source: 'iana',
      },
      'application/sbml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['sbml'],
      },
      'application/scaip+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/scim+json': {
        source: 'iana',
        compressible: true,
      },
      'application/scvp-cv-request': {
        source: 'iana',
        extensions: ['scq'],
      },
      'application/scvp-cv-response': {
        source: 'iana',
        extensions: ['scs'],
      },
      'application/scvp-vp-request': {
        source: 'iana',
        extensions: ['spq'],
      },
      'application/scvp-vp-response': {
        source: 'iana',
        extensions: ['spp'],
      },
      'application/sdp': {
        source: 'iana',
        extensions: ['sdp'],
      },
      'application/secevent+jwt': {
        source: 'iana',
      },
      'application/senml+cbor': {
        source: 'iana',
      },
      'application/senml+json': {
        source: 'iana',
        compressible: true,
      },
      'application/senml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['senmlx'],
      },
      'application/senml-etch+cbor': {
        source: 'iana',
      },
      'application/senml-etch+json': {
        source: 'iana',
        compressible: true,
      },
      'application/senml-exi': {
        source: 'iana',
      },
      'application/sensml+cbor': {
        source: 'iana',
      },
      'application/sensml+json': {
        source: 'iana',
        compressible: true,
      },
      'application/sensml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['sensmlx'],
      },
      'application/sensml-exi': {
        source: 'iana',
      },
      'application/sep+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/sep-exi': {
        source: 'iana',
      },
      'application/session-info': {
        source: 'iana',
      },
      'application/set-payment': {
        source: 'iana',
      },
      'application/set-payment-initiation': {
        source: 'iana',
        extensions: ['setpay'],
      },
      'application/set-registration': {
        source: 'iana',
      },
      'application/set-registration-initiation': {
        source: 'iana',
        extensions: ['setreg'],
      },
      'application/sgml': {
        source: 'iana',
      },
      'application/sgml-open-catalog': {
        source: 'iana',
      },
      'application/shf+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['shf'],
      },
      'application/sieve': {
        source: 'iana',
        extensions: ['siv', 'sieve'],
      },
      'application/simple-filter+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/simple-message-summary': {
        source: 'iana',
      },
      'application/simplesymbolcontainer': {
        source: 'iana',
      },
      'application/sipc': {
        source: 'iana',
      },
      'application/slate': {
        source: 'iana',
      },
      'application/smil': {
        source: 'iana',
      },
      'application/smil+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['smi', 'smil'],
      },
      'application/smpte336m': {
        source: 'iana',
      },
      'application/soap+fastinfoset': {
        source: 'iana',
      },
      'application/soap+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/sparql-query': {
        source: 'iana',
        extensions: ['rq'],
      },
      'application/sparql-results+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['srx'],
      },
      'application/spirits-event+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/sql': {
        source: 'iana',
      },
      'application/srgs': {
        source: 'iana',
        extensions: ['gram'],
      },
      'application/srgs+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['grxml'],
      },
      'application/sru+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['sru'],
      },
      'application/ssdl+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['ssdl'],
      },
      'application/ssml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['ssml'],
      },
      'application/stix+json': {
        source: 'iana',
        compressible: true,
      },
      'application/swid+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['swidtag'],
      },
      'application/tamp-apex-update': {
        source: 'iana',
      },
      'application/tamp-apex-update-confirm': {
        source: 'iana',
      },
      'application/tamp-community-update': {
        source: 'iana',
      },
      'application/tamp-community-update-confirm': {
        source: 'iana',
      },
      'application/tamp-error': {
        source: 'iana',
      },
      'application/tamp-sequence-adjust': {
        source: 'iana',
      },
      'application/tamp-sequence-adjust-confirm': {
        source: 'iana',
      },
      'application/tamp-status-query': {
        source: 'iana',
      },
      'application/tamp-status-response': {
        source: 'iana',
      },
      'application/tamp-update': {
        source: 'iana',
      },
      'application/tamp-update-confirm': {
        source: 'iana',
      },
      'application/tar': {
        compressible: true,
      },
      'application/taxii+json': {
        source: 'iana',
        compressible: true,
      },
      'application/td+json': {
        source: 'iana',
        compressible: true,
      },
      'application/tei+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['tei', 'teicorpus'],
      },
      'application/tetra_isi': {
        source: 'iana',
      },
      'application/thraud+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['tfi'],
      },
      'application/timestamp-query': {
        source: 'iana',
      },
      'application/timestamp-reply': {
        source: 'iana',
      },
      'application/timestamped-data': {
        source: 'iana',
        extensions: ['tsd'],
      },
      'application/tlsrpt+gzip': {
        source: 'iana',
      },
      'application/tlsrpt+json': {
        source: 'iana',
        compressible: true,
      },
      'application/tnauthlist': {
        source: 'iana',
      },
      'application/toml': {
        compressible: true,
        extensions: ['toml'],
      },
      'application/trickle-ice-sdpfrag': {
        source: 'iana',
      },
      'application/trig': {
        source: 'iana',
      },
      'application/ttml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['ttml'],
      },
      'application/tve-trigger': {
        source: 'iana',
      },
      'application/tzif': {
        source: 'iana',
      },
      'application/tzif-leap': {
        source: 'iana',
      },
      'application/ubjson': {
        compressible: false,
        extensions: ['ubj'],
      },
      'application/ulpfec': {
        source: 'iana',
      },
      'application/urc-grpsheet+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/urc-ressheet+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['rsheet'],
      },
      'application/urc-targetdesc+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['td'],
      },
      'application/urc-uisocketdesc+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vcard+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vcard+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vemmi': {
        source: 'iana',
      },
      'application/vividence.scriptfile': {
        source: 'apache',
      },
      'application/vnd.1000minds.decision-model+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['1km'],
      },
      'application/vnd.3gpp-prose+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp-prose-pc3ch+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp-v2x-local-service-information': {
        source: 'iana',
      },
      'application/vnd.3gpp.access-transfer-events+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.bsf+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.gmop+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.interworking-data': {
        source: 'iana',
      },
      'application/vnd.3gpp.mc-signalling-ear': {
        source: 'iana',
      },
      'application/vnd.3gpp.mcdata-affiliation-command+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcdata-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcdata-payload': {
        source: 'iana',
      },
      'application/vnd.3gpp.mcdata-service-config+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcdata-signalling': {
        source: 'iana',
      },
      'application/vnd.3gpp.mcdata-ue-config+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcdata-user-profile+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcptt-affiliation-command+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcptt-floor-request+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcptt-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcptt-location-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcptt-mbms-usage-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcptt-service-config+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcptt-signed+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcptt-ue-config+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcptt-ue-init-config+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcptt-user-profile+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcvideo-affiliation-command+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcvideo-affiliation-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcvideo-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcvideo-location-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcvideo-mbms-usage-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcvideo-service-config+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcvideo-transmission-request+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcvideo-ue-config+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mcvideo-user-profile+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.mid-call+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.pic-bw-large': {
        source: 'iana',
        extensions: ['plb'],
      },
      'application/vnd.3gpp.pic-bw-small': {
        source: 'iana',
        extensions: ['psb'],
      },
      'application/vnd.3gpp.pic-bw-var': {
        source: 'iana',
        extensions: ['pvb'],
      },
      'application/vnd.3gpp.sms': {
        source: 'iana',
      },
      'application/vnd.3gpp.sms+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.srvcc-ext+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.srvcc-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.state-and-event-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp.ussd+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp2.bcmcsinfo+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.3gpp2.sms': {
        source: 'iana',
      },
      'application/vnd.3gpp2.tcap': {
        source: 'iana',
        extensions: ['tcap'],
      },
      'application/vnd.3lightssoftware.imagescal': {
        source: 'iana',
      },
      'application/vnd.3m.post-it-notes': {
        source: 'iana',
        extensions: ['pwn'],
      },
      'application/vnd.accpac.simply.aso': {
        source: 'iana',
        extensions: ['aso'],
      },
      'application/vnd.accpac.simply.imp': {
        source: 'iana',
        extensions: ['imp'],
      },
      'application/vnd.acucobol': {
        source: 'iana',
        extensions: ['acu'],
      },
      'application/vnd.acucorp': {
        source: 'iana',
        extensions: ['atc', 'acutc'],
      },
      'application/vnd.adobe.air-application-installer-package+zip': {
        source: 'apache',
        compressible: false,
        extensions: ['air'],
      },
      'application/vnd.adobe.flash.movie': {
        source: 'iana',
      },
      'application/vnd.adobe.formscentral.fcdt': {
        source: 'iana',
        extensions: ['fcdt'],
      },
      'application/vnd.adobe.fxp': {
        source: 'iana',
        extensions: ['fxp', 'fxpl'],
      },
      'application/vnd.adobe.partial-upload': {
        source: 'iana',
      },
      'application/vnd.adobe.xdp+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xdp'],
      },
      'application/vnd.adobe.xfdf': {
        source: 'iana',
        extensions: ['xfdf'],
      },
      'application/vnd.aether.imp': {
        source: 'iana',
      },
      'application/vnd.afpc.afplinedata': {
        source: 'iana',
      },
      'application/vnd.afpc.afplinedata-pagedef': {
        source: 'iana',
      },
      'application/vnd.afpc.cmoca-cmresource': {
        source: 'iana',
      },
      'application/vnd.afpc.foca-charset': {
        source: 'iana',
      },
      'application/vnd.afpc.foca-codedfont': {
        source: 'iana',
      },
      'application/vnd.afpc.foca-codepage': {
        source: 'iana',
      },
      'application/vnd.afpc.modca': {
        source: 'iana',
      },
      'application/vnd.afpc.modca-cmtable': {
        source: 'iana',
      },
      'application/vnd.afpc.modca-formdef': {
        source: 'iana',
      },
      'application/vnd.afpc.modca-mediummap': {
        source: 'iana',
      },
      'application/vnd.afpc.modca-objectcontainer': {
        source: 'iana',
      },
      'application/vnd.afpc.modca-overlay': {
        source: 'iana',
      },
      'application/vnd.afpc.modca-pagesegment': {
        source: 'iana',
      },
      'application/vnd.ah-barcode': {
        source: 'iana',
      },
      'application/vnd.ahead.space': {
        source: 'iana',
        extensions: ['ahead'],
      },
      'application/vnd.airzip.filesecure.azf': {
        source: 'iana',
        extensions: ['azf'],
      },
      'application/vnd.airzip.filesecure.azs': {
        source: 'iana',
        extensions: ['azs'],
      },
      'application/vnd.amadeus+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.amazon.ebook': {
        source: 'apache',
        extensions: ['azw'],
      },
      'application/vnd.amazon.mobi8-ebook': {
        source: 'iana',
      },
      'application/vnd.americandynamics.acc': {
        source: 'iana',
        extensions: ['acc'],
      },
      'application/vnd.amiga.ami': {
        source: 'iana',
        extensions: ['ami'],
      },
      'application/vnd.amundsen.maze+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.android.ota': {
        source: 'iana',
      },
      'application/vnd.android.package-archive': {
        source: 'apache',
        compressible: false,
        extensions: ['apk'],
      },
      'application/vnd.anki': {
        source: 'iana',
      },
      'application/vnd.anser-web-certificate-issue-initiation': {
        source: 'iana',
        extensions: ['cii'],
      },
      'application/vnd.anser-web-funds-transfer-initiation': {
        source: 'apache',
        extensions: ['fti'],
      },
      'application/vnd.antix.game-component': {
        source: 'iana',
        extensions: ['atx'],
      },
      'application/vnd.apache.thrift.binary': {
        source: 'iana',
      },
      'application/vnd.apache.thrift.compact': {
        source: 'iana',
      },
      'application/vnd.apache.thrift.json': {
        source: 'iana',
      },
      'application/vnd.api+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.aplextor.warrp+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.apothekende.reservation+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.apple.installer+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['mpkg'],
      },
      'application/vnd.apple.keynote': {
        source: 'iana',
        extensions: ['key'],
      },
      'application/vnd.apple.mpegurl': {
        source: 'iana',
        extensions: ['m3u8'],
      },
      'application/vnd.apple.numbers': {
        source: 'iana',
        extensions: ['numbers'],
      },
      'application/vnd.apple.pages': {
        source: 'iana',
        extensions: ['pages'],
      },
      'application/vnd.apple.pkpass': {
        compressible: false,
        extensions: ['pkpass'],
      },
      'application/vnd.arastra.swi': {
        source: 'iana',
      },
      'application/vnd.aristanetworks.swi': {
        source: 'iana',
        extensions: ['swi'],
      },
      'application/vnd.artisan+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.artsquare': {
        source: 'iana',
      },
      'application/vnd.astraea-software.iota': {
        source: 'iana',
        extensions: ['iota'],
      },
      'application/vnd.audiograph': {
        source: 'iana',
        extensions: ['aep'],
      },
      'application/vnd.autopackage': {
        source: 'iana',
      },
      'application/vnd.avalon+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.avistar+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.balsamiq.bmml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['bmml'],
      },
      'application/vnd.balsamiq.bmpr': {
        source: 'iana',
      },
      'application/vnd.banana-accounting': {
        source: 'iana',
      },
      'application/vnd.bbf.usp.error': {
        source: 'iana',
      },
      'application/vnd.bbf.usp.msg': {
        source: 'iana',
      },
      'application/vnd.bbf.usp.msg+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.bekitzur-stech+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.bint.med-content': {
        source: 'iana',
      },
      'application/vnd.biopax.rdf+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.blink-idb-value-wrapper': {
        source: 'iana',
      },
      'application/vnd.blueice.multipass': {
        source: 'iana',
        extensions: ['mpm'],
      },
      'application/vnd.bluetooth.ep.oob': {
        source: 'iana',
      },
      'application/vnd.bluetooth.le.oob': {
        source: 'iana',
      },
      'application/vnd.bmi': {
        source: 'iana',
        extensions: ['bmi'],
      },
      'application/vnd.bpf': {
        source: 'iana',
      },
      'application/vnd.bpf3': {
        source: 'iana',
      },
      'application/vnd.businessobjects': {
        source: 'iana',
        extensions: ['rep'],
      },
      'application/vnd.byu.uapi+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.cab-jscript': {
        source: 'iana',
      },
      'application/vnd.canon-cpdl': {
        source: 'iana',
      },
      'application/vnd.canon-lips': {
        source: 'iana',
      },
      'application/vnd.capasystems-pg+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.cendio.thinlinc.clientconf': {
        source: 'iana',
      },
      'application/vnd.century-systems.tcp_stream': {
        source: 'iana',
      },
      'application/vnd.chemdraw+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['cdxml'],
      },
      'application/vnd.chess-pgn': {
        source: 'iana',
      },
      'application/vnd.chipnuts.karaoke-mmd': {
        source: 'iana',
        extensions: ['mmd'],
      },
      'application/vnd.ciedi': {
        source: 'iana',
      },
      'application/vnd.cinderella': {
        source: 'iana',
        extensions: ['cdy'],
      },
      'application/vnd.cirpack.isdn-ext': {
        source: 'iana',
      },
      'application/vnd.citationstyles.style+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['csl'],
      },
      'application/vnd.claymore': {
        source: 'iana',
        extensions: ['cla'],
      },
      'application/vnd.cloanto.rp9': {
        source: 'iana',
        extensions: ['rp9'],
      },
      'application/vnd.clonk.c4group': {
        source: 'iana',
        extensions: ['c4g', 'c4d', 'c4f', 'c4p', 'c4u'],
      },
      'application/vnd.cluetrust.cartomobile-config': {
        source: 'iana',
        extensions: ['c11amc'],
      },
      'application/vnd.cluetrust.cartomobile-config-pkg': {
        source: 'iana',
        extensions: ['c11amz'],
      },
      'application/vnd.coffeescript': {
        source: 'iana',
      },
      'application/vnd.collabio.xodocuments.document': {
        source: 'iana',
      },
      'application/vnd.collabio.xodocuments.document-template': {
        source: 'iana',
      },
      'application/vnd.collabio.xodocuments.presentation': {
        source: 'iana',
      },
      'application/vnd.collabio.xodocuments.presentation-template': {
        source: 'iana',
      },
      'application/vnd.collabio.xodocuments.spreadsheet': {
        source: 'iana',
      },
      'application/vnd.collabio.xodocuments.spreadsheet-template': {
        source: 'iana',
      },
      'application/vnd.collection+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.collection.doc+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.collection.next+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.comicbook+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.comicbook-rar': {
        source: 'iana',
      },
      'application/vnd.commerce-battelle': {
        source: 'iana',
      },
      'application/vnd.commonspace': {
        source: 'iana',
        extensions: ['csp'],
      },
      'application/vnd.contact.cmsg': {
        source: 'iana',
        extensions: ['cdbcmsg'],
      },
      'application/vnd.coreos.ignition+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.cosmocaller': {
        source: 'iana',
        extensions: ['cmc'],
      },
      'application/vnd.crick.clicker': {
        source: 'iana',
        extensions: ['clkx'],
      },
      'application/vnd.crick.clicker.keyboard': {
        source: 'iana',
        extensions: ['clkk'],
      },
      'application/vnd.crick.clicker.palette': {
        source: 'iana',
        extensions: ['clkp'],
      },
      'application/vnd.crick.clicker.template': {
        source: 'iana',
        extensions: ['clkt'],
      },
      'application/vnd.crick.clicker.wordbank': {
        source: 'iana',
        extensions: ['clkw'],
      },
      'application/vnd.criticaltools.wbs+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['wbs'],
      },
      'application/vnd.cryptii.pipe+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.crypto-shade-file': {
        source: 'iana',
      },
      'application/vnd.cryptomator.encrypted': {
        source: 'iana',
      },
      'application/vnd.ctc-posml': {
        source: 'iana',
        extensions: ['pml'],
      },
      'application/vnd.ctct.ws+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.cups-pdf': {
        source: 'iana',
      },
      'application/vnd.cups-postscript': {
        source: 'iana',
      },
      'application/vnd.cups-ppd': {
        source: 'iana',
        extensions: ['ppd'],
      },
      'application/vnd.cups-raster': {
        source: 'iana',
      },
      'application/vnd.cups-raw': {
        source: 'iana',
      },
      'application/vnd.curl': {
        source: 'iana',
      },
      'application/vnd.curl.car': {
        source: 'apache',
        extensions: ['car'],
      },
      'application/vnd.curl.pcurl': {
        source: 'apache',
        extensions: ['pcurl'],
      },
      'application/vnd.cyan.dean.root+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.cybank': {
        source: 'iana',
      },
      'application/vnd.cyclonedx+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.cyclonedx+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.d2l.coursepackage1p0+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.d3m-dataset': {
        source: 'iana',
      },
      'application/vnd.d3m-problem': {
        source: 'iana',
      },
      'application/vnd.dart': {
        source: 'iana',
        compressible: true,
        extensions: ['dart'],
      },
      'application/vnd.data-vision.rdz': {
        source: 'iana',
        extensions: ['rdz'],
      },
      'application/vnd.datapackage+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dataresource+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dbf': {
        source: 'iana',
        extensions: ['dbf'],
      },
      'application/vnd.debian.binary-package': {
        source: 'iana',
      },
      'application/vnd.dece.data': {
        source: 'iana',
        extensions: ['uvf', 'uvvf', 'uvd', 'uvvd'],
      },
      'application/vnd.dece.ttml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['uvt', 'uvvt'],
      },
      'application/vnd.dece.unspecified': {
        source: 'iana',
        extensions: ['uvx', 'uvvx'],
      },
      'application/vnd.dece.zip': {
        source: 'iana',
        extensions: ['uvz', 'uvvz'],
      },
      'application/vnd.denovo.fcselayout-link': {
        source: 'iana',
        extensions: ['fe_launch'],
      },
      'application/vnd.desmume.movie': {
        source: 'iana',
      },
      'application/vnd.dir-bi.plate-dl-nosuffix': {
        source: 'iana',
      },
      'application/vnd.dm.delegation+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dna': {
        source: 'iana',
        extensions: ['dna'],
      },
      'application/vnd.document+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dolby.mlp': {
        source: 'apache',
        extensions: ['mlp'],
      },
      'application/vnd.dolby.mobile.1': {
        source: 'iana',
      },
      'application/vnd.dolby.mobile.2': {
        source: 'iana',
      },
      'application/vnd.doremir.scorecloud-binary-document': {
        source: 'iana',
      },
      'application/vnd.dpgraph': {
        source: 'iana',
        extensions: ['dpg'],
      },
      'application/vnd.dreamfactory': {
        source: 'iana',
        extensions: ['dfac'],
      },
      'application/vnd.drive+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ds-keypoint': {
        source: 'apache',
        extensions: ['kpxx'],
      },
      'application/vnd.dtg.local': {
        source: 'iana',
      },
      'application/vnd.dtg.local.flash': {
        source: 'iana',
      },
      'application/vnd.dtg.local.html': {
        source: 'iana',
      },
      'application/vnd.dvb.ait': {
        source: 'iana',
        extensions: ['ait'],
      },
      'application/vnd.dvb.dvbisl+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dvb.dvbj': {
        source: 'iana',
      },
      'application/vnd.dvb.esgcontainer': {
        source: 'iana',
      },
      'application/vnd.dvb.ipdcdftnotifaccess': {
        source: 'iana',
      },
      'application/vnd.dvb.ipdcesgaccess': {
        source: 'iana',
      },
      'application/vnd.dvb.ipdcesgaccess2': {
        source: 'iana',
      },
      'application/vnd.dvb.ipdcesgpdd': {
        source: 'iana',
      },
      'application/vnd.dvb.ipdcroaming': {
        source: 'iana',
      },
      'application/vnd.dvb.iptv.alfec-base': {
        source: 'iana',
      },
      'application/vnd.dvb.iptv.alfec-enhancement': {
        source: 'iana',
      },
      'application/vnd.dvb.notif-aggregate-root+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dvb.notif-container+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dvb.notif-generic+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dvb.notif-ia-msglist+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dvb.notif-ia-registration-request+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dvb.notif-ia-registration-response+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dvb.notif-init+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.dvb.pfr': {
        source: 'iana',
      },
      'application/vnd.dvb.service': {
        source: 'iana',
        extensions: ['svc'],
      },
      'application/vnd.dxr': {
        source: 'iana',
      },
      'application/vnd.dynageo': {
        source: 'iana',
        extensions: ['geo'],
      },
      'application/vnd.dzr': {
        source: 'iana',
      },
      'application/vnd.easykaraoke.cdgdownload': {
        source: 'iana',
      },
      'application/vnd.ecdis-update': {
        source: 'iana',
      },
      'application/vnd.ecip.rlp': {
        source: 'iana',
      },
      'application/vnd.ecowin.chart': {
        source: 'iana',
        extensions: ['mag'],
      },
      'application/vnd.ecowin.filerequest': {
        source: 'iana',
      },
      'application/vnd.ecowin.fileupdate': {
        source: 'iana',
      },
      'application/vnd.ecowin.series': {
        source: 'iana',
      },
      'application/vnd.ecowin.seriesrequest': {
        source: 'iana',
      },
      'application/vnd.ecowin.seriesupdate': {
        source: 'iana',
      },
      'application/vnd.efi.img': {
        source: 'iana',
      },
      'application/vnd.efi.iso': {
        source: 'iana',
      },
      'application/vnd.emclient.accessrequest+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.enliven': {
        source: 'iana',
        extensions: ['nml'],
      },
      'application/vnd.enphase.envoy': {
        source: 'iana',
      },
      'application/vnd.eprints.data+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.epson.esf': {
        source: 'iana',
        extensions: ['esf'],
      },
      'application/vnd.epson.msf': {
        source: 'iana',
        extensions: ['msf'],
      },
      'application/vnd.epson.quickanime': {
        source: 'iana',
        extensions: ['qam'],
      },
      'application/vnd.epson.salt': {
        source: 'iana',
        extensions: ['slt'],
      },
      'application/vnd.epson.ssf': {
        source: 'iana',
        extensions: ['ssf'],
      },
      'application/vnd.ericsson.quickcall': {
        source: 'iana',
      },
      'application/vnd.espass-espass+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.eszigno3+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['es3', 'et3'],
      },
      'application/vnd.etsi.aoc+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.asic-e+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.etsi.asic-s+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.etsi.cug+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.iptvcommand+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.iptvdiscovery+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.iptvprofile+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.iptvsad-bc+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.iptvsad-cod+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.iptvsad-npvr+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.iptvservice+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.iptvsync+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.iptvueprofile+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.mcid+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.mheg5': {
        source: 'iana',
      },
      'application/vnd.etsi.overload-control-policy-dataset+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.pstn+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.sci+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.simservs+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.timestamp-token': {
        source: 'iana',
      },
      'application/vnd.etsi.tsl+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.etsi.tsl.der': {
        source: 'iana',
      },
      'application/vnd.eudora.data': {
        source: 'iana',
      },
      'application/vnd.evolv.ecig.profile': {
        source: 'iana',
      },
      'application/vnd.evolv.ecig.settings': {
        source: 'iana',
      },
      'application/vnd.evolv.ecig.theme': {
        source: 'iana',
      },
      'application/vnd.exstream-empower+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.exstream-package': {
        source: 'iana',
      },
      'application/vnd.ezpix-album': {
        source: 'iana',
        extensions: ['ez2'],
      },
      'application/vnd.ezpix-package': {
        source: 'iana',
        extensions: ['ez3'],
      },
      'application/vnd.f-secure.mobile': {
        source: 'iana',
      },
      'application/vnd.fastcopy-disk-image': {
        source: 'iana',
      },
      'application/vnd.fdf': {
        source: 'iana',
        extensions: ['fdf'],
      },
      'application/vnd.fdsn.mseed': {
        source: 'iana',
        extensions: ['mseed'],
      },
      'application/vnd.fdsn.seed': {
        source: 'iana',
        extensions: ['seed', 'dataless'],
      },
      'application/vnd.ffsns': {
        source: 'iana',
      },
      'application/vnd.ficlab.flb+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.filmit.zfc': {
        source: 'iana',
      },
      'application/vnd.fints': {
        source: 'iana',
      },
      'application/vnd.firemonkeys.cloudcell': {
        source: 'iana',
      },
      'application/vnd.flographit': {
        source: 'iana',
        extensions: ['gph'],
      },
      'application/vnd.fluxtime.clip': {
        source: 'iana',
        extensions: ['ftc'],
      },
      'application/vnd.font-fontforge-sfd': {
        source: 'iana',
      },
      'application/vnd.framemaker': {
        source: 'iana',
        extensions: ['fm', 'frame', 'maker', 'book'],
      },
      'application/vnd.frogans.fnc': {
        source: 'iana',
        extensions: ['fnc'],
      },
      'application/vnd.frogans.ltf': {
        source: 'iana',
        extensions: ['ltf'],
      },
      'application/vnd.fsc.weblaunch': {
        source: 'iana',
        extensions: ['fsc'],
      },
      'application/vnd.fujitsu.oasys': {
        source: 'iana',
        extensions: ['oas'],
      },
      'application/vnd.fujitsu.oasys2': {
        source: 'iana',
        extensions: ['oa2'],
      },
      'application/vnd.fujitsu.oasys3': {
        source: 'iana',
        extensions: ['oa3'],
      },
      'application/vnd.fujitsu.oasysgp': {
        source: 'iana',
        extensions: ['fg5'],
      },
      'application/vnd.fujitsu.oasysprs': {
        source: 'iana',
        extensions: ['bh2'],
      },
      'application/vnd.fujixerox.art-ex': {
        source: 'iana',
      },
      'application/vnd.fujixerox.art4': {
        source: 'iana',
      },
      'application/vnd.fujixerox.ddd': {
        source: 'iana',
        extensions: ['ddd'],
      },
      'application/vnd.fujixerox.docuworks': {
        source: 'iana',
        extensions: ['xdw'],
      },
      'application/vnd.fujixerox.docuworks.binder': {
        source: 'iana',
        extensions: ['xbd'],
      },
      'application/vnd.fujixerox.docuworks.container': {
        source: 'iana',
      },
      'application/vnd.fujixerox.hbpl': {
        source: 'iana',
      },
      'application/vnd.fut-misnet': {
        source: 'iana',
      },
      'application/vnd.futoin+cbor': {
        source: 'iana',
      },
      'application/vnd.futoin+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.fuzzysheet': {
        source: 'iana',
        extensions: ['fzs'],
      },
      'application/vnd.genomatix.tuxedo': {
        source: 'iana',
        extensions: ['txd'],
      },
      'application/vnd.gentics.grd+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.geo+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.geocube+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.geogebra.file': {
        source: 'iana',
        extensions: ['ggb'],
      },
      'application/vnd.geogebra.slides': {
        source: 'iana',
      },
      'application/vnd.geogebra.tool': {
        source: 'iana',
        extensions: ['ggt'],
      },
      'application/vnd.geometry-explorer': {
        source: 'iana',
        extensions: ['gex', 'gre'],
      },
      'application/vnd.geonext': {
        source: 'iana',
        extensions: ['gxt'],
      },
      'application/vnd.geoplan': {
        source: 'iana',
        extensions: ['g2w'],
      },
      'application/vnd.geospace': {
        source: 'iana',
        extensions: ['g3w'],
      },
      'application/vnd.gerber': {
        source: 'iana',
      },
      'application/vnd.globalplatform.card-content-mgt': {
        source: 'iana',
      },
      'application/vnd.globalplatform.card-content-mgt-response': {
        source: 'iana',
      },
      'application/vnd.gmx': {
        source: 'iana',
        extensions: ['gmx'],
      },
      'application/vnd.google-apps.document': {
        compressible: false,
        extensions: ['gdoc'],
      },
      'application/vnd.google-apps.presentation': {
        compressible: false,
        extensions: ['gslides'],
      },
      'application/vnd.google-apps.spreadsheet': {
        compressible: false,
        extensions: ['gsheet'],
      },
      'application/vnd.google-earth.kml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['kml'],
      },
      'application/vnd.google-earth.kmz': {
        source: 'iana',
        compressible: false,
        extensions: ['kmz'],
      },
      'application/vnd.gov.sk.e-form+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.gov.sk.e-form+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.gov.sk.xmldatacontainer+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.grafeq': {
        source: 'iana',
        extensions: ['gqf', 'gqs'],
      },
      'application/vnd.gridmp': {
        source: 'iana',
      },
      'application/vnd.groove-account': {
        source: 'iana',
        extensions: ['gac'],
      },
      'application/vnd.groove-help': {
        source: 'iana',
        extensions: ['ghf'],
      },
      'application/vnd.groove-identity-message': {
        source: 'iana',
        extensions: ['gim'],
      },
      'application/vnd.groove-injector': {
        source: 'iana',
        extensions: ['grv'],
      },
      'application/vnd.groove-tool-message': {
        source: 'iana',
        extensions: ['gtm'],
      },
      'application/vnd.groove-tool-template': {
        source: 'iana',
        extensions: ['tpl'],
      },
      'application/vnd.groove-vcard': {
        source: 'iana',
        extensions: ['vcg'],
      },
      'application/vnd.hal+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.hal+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['hal'],
      },
      'application/vnd.handheld-entertainment+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['zmm'],
      },
      'application/vnd.hbci': {
        source: 'iana',
        extensions: ['hbci'],
      },
      'application/vnd.hc+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.hcl-bireports': {
        source: 'iana',
      },
      'application/vnd.hdt': {
        source: 'iana',
      },
      'application/vnd.heroku+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.hhe.lesson-player': {
        source: 'iana',
        extensions: ['les'],
      },
      'application/vnd.hp-hpgl': {
        source: 'iana',
        extensions: ['hpgl'],
      },
      'application/vnd.hp-hpid': {
        source: 'iana',
        extensions: ['hpid'],
      },
      'application/vnd.hp-hps': {
        source: 'iana',
        extensions: ['hps'],
      },
      'application/vnd.hp-jlyt': {
        source: 'iana',
        extensions: ['jlt'],
      },
      'application/vnd.hp-pcl': {
        source: 'iana',
        extensions: ['pcl'],
      },
      'application/vnd.hp-pclxl': {
        source: 'iana',
        extensions: ['pclxl'],
      },
      'application/vnd.httphone': {
        source: 'iana',
      },
      'application/vnd.hydrostatix.sof-data': {
        source: 'iana',
        extensions: ['sfd-hdstx'],
      },
      'application/vnd.hyper+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.hyper-item+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.hyperdrive+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.hzn-3d-crossword': {
        source: 'iana',
      },
      'application/vnd.ibm.afplinedata': {
        source: 'iana',
      },
      'application/vnd.ibm.electronic-media': {
        source: 'iana',
      },
      'application/vnd.ibm.minipay': {
        source: 'iana',
        extensions: ['mpy'],
      },
      'application/vnd.ibm.modcap': {
        source: 'iana',
        extensions: ['afp', 'listafp', 'list3820'],
      },
      'application/vnd.ibm.rights-management': {
        source: 'iana',
        extensions: ['irm'],
      },
      'application/vnd.ibm.secure-container': {
        source: 'iana',
        extensions: ['sc'],
      },
      'application/vnd.iccprofile': {
        source: 'iana',
        extensions: ['icc', 'icm'],
      },
      'application/vnd.ieee.1905': {
        source: 'iana',
      },
      'application/vnd.igloader': {
        source: 'iana',
        extensions: ['igl'],
      },
      'application/vnd.imagemeter.folder+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.imagemeter.image+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.immervision-ivp': {
        source: 'iana',
        extensions: ['ivp'],
      },
      'application/vnd.immervision-ivu': {
        source: 'iana',
        extensions: ['ivu'],
      },
      'application/vnd.ims.imsccv1p1': {
        source: 'iana',
      },
      'application/vnd.ims.imsccv1p2': {
        source: 'iana',
      },
      'application/vnd.ims.imsccv1p3': {
        source: 'iana',
      },
      'application/vnd.ims.lis.v2.result+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ims.lti.v2.toolconsumerprofile+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ims.lti.v2.toolproxy+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ims.lti.v2.toolproxy.id+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ims.lti.v2.toolsettings+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ims.lti.v2.toolsettings.simple+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.informedcontrol.rms+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.informix-visionary': {
        source: 'iana',
      },
      'application/vnd.infotech.project': {
        source: 'iana',
      },
      'application/vnd.infotech.project+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.innopath.wamp.notification': {
        source: 'iana',
      },
      'application/vnd.insors.igm': {
        source: 'iana',
        extensions: ['igm'],
      },
      'application/vnd.intercon.formnet': {
        source: 'iana',
        extensions: ['xpw', 'xpx'],
      },
      'application/vnd.intergeo': {
        source: 'iana',
        extensions: ['i2g'],
      },
      'application/vnd.intertrust.digibox': {
        source: 'iana',
      },
      'application/vnd.intertrust.nncp': {
        source: 'iana',
      },
      'application/vnd.intu.qbo': {
        source: 'iana',
        extensions: ['qbo'],
      },
      'application/vnd.intu.qfx': {
        source: 'iana',
        extensions: ['qfx'],
      },
      'application/vnd.iptc.g2.catalogitem+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.iptc.g2.conceptitem+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.iptc.g2.knowledgeitem+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.iptc.g2.newsitem+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.iptc.g2.newsmessage+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.iptc.g2.packageitem+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.iptc.g2.planningitem+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ipunplugged.rcprofile': {
        source: 'iana',
        extensions: ['rcprofile'],
      },
      'application/vnd.irepository.package+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['irp'],
      },
      'application/vnd.is-xpr': {
        source: 'iana',
        extensions: ['xpr'],
      },
      'application/vnd.isac.fcs': {
        source: 'iana',
        extensions: ['fcs'],
      },
      'application/vnd.iso11783-10+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.jam': {
        source: 'iana',
        extensions: ['jam'],
      },
      'application/vnd.japannet-directory-service': {
        source: 'iana',
      },
      'application/vnd.japannet-jpnstore-wakeup': {
        source: 'iana',
      },
      'application/vnd.japannet-payment-wakeup': {
        source: 'iana',
      },
      'application/vnd.japannet-registration': {
        source: 'iana',
      },
      'application/vnd.japannet-registration-wakeup': {
        source: 'iana',
      },
      'application/vnd.japannet-setstore-wakeup': {
        source: 'iana',
      },
      'application/vnd.japannet-verification': {
        source: 'iana',
      },
      'application/vnd.japannet-verification-wakeup': {
        source: 'iana',
      },
      'application/vnd.jcp.javame.midlet-rms': {
        source: 'iana',
        extensions: ['rms'],
      },
      'application/vnd.jisp': {
        source: 'iana',
        extensions: ['jisp'],
      },
      'application/vnd.joost.joda-archive': {
        source: 'iana',
        extensions: ['joda'],
      },
      'application/vnd.jsk.isdn-ngn': {
        source: 'iana',
      },
      'application/vnd.kahootz': {
        source: 'iana',
        extensions: ['ktz', 'ktr'],
      },
      'application/vnd.kde.karbon': {
        source: 'iana',
        extensions: ['karbon'],
      },
      'application/vnd.kde.kchart': {
        source: 'iana',
        extensions: ['chrt'],
      },
      'application/vnd.kde.kformula': {
        source: 'iana',
        extensions: ['kfo'],
      },
      'application/vnd.kde.kivio': {
        source: 'iana',
        extensions: ['flw'],
      },
      'application/vnd.kde.kontour': {
        source: 'iana',
        extensions: ['kon'],
      },
      'application/vnd.kde.kpresenter': {
        source: 'iana',
        extensions: ['kpr', 'kpt'],
      },
      'application/vnd.kde.kspread': {
        source: 'iana',
        extensions: ['ksp'],
      },
      'application/vnd.kde.kword': {
        source: 'iana',
        extensions: ['kwd', 'kwt'],
      },
      'application/vnd.kenameaapp': {
        source: 'iana',
        extensions: ['htke'],
      },
      'application/vnd.kidspiration': {
        source: 'iana',
        extensions: ['kia'],
      },
      'application/vnd.kinar': {
        source: 'iana',
        extensions: ['kne', 'knp'],
      },
      'application/vnd.koan': {
        source: 'iana',
        extensions: ['skp', 'skd', 'skt', 'skm'],
      },
      'application/vnd.kodak-descriptor': {
        source: 'iana',
        extensions: ['sse'],
      },
      'application/vnd.las': {
        source: 'iana',
      },
      'application/vnd.las.las+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.las.las+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['lasxml'],
      },
      'application/vnd.laszip': {
        source: 'iana',
      },
      'application/vnd.leap+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.liberty-request+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.llamagraphics.life-balance.desktop': {
        source: 'iana',
        extensions: ['lbd'],
      },
      'application/vnd.llamagraphics.life-balance.exchange+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['lbe'],
      },
      'application/vnd.logipipe.circuit+zip': {
        source: 'iana',
        compressible: false,
      },
      'application/vnd.loom': {
        source: 'iana',
      },
      'application/vnd.lotus-1-2-3': {
        source: 'iana',
        extensions: ['123'],
      },
      'application/vnd.lotus-approach': {
        source: 'iana',
        extensions: ['apr'],
      },
      'application/vnd.lotus-freelance': {
        source: 'iana',
        extensions: ['pre'],
      },
      'application/vnd.lotus-notes': {
        source: 'iana',
        extensions: ['nsf'],
      },
      'application/vnd.lotus-organizer': {
        source: 'iana',
        extensions: ['org'],
      },
      'application/vnd.lotus-screencam': {
        source: 'iana',
        extensions: ['scm'],
      },
      'application/vnd.lotus-wordpro': {
        source: 'iana',
        extensions: ['lwp'],
      },
      'application/vnd.macports.portpkg': {
        source: 'iana',
        extensions: ['portpkg'],
      },
      'application/vnd.mapbox-vector-tile': {
        source: 'iana',
      },
      'application/vnd.marlin.drm.actiontoken+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.marlin.drm.conftoken+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.marlin.drm.license+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.marlin.drm.mdcf': {
        source: 'iana',
      },
      'application/vnd.mason+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.maxmind.maxmind-db': {
        source: 'iana',
      },
      'application/vnd.mcd': {
        source: 'iana',
        extensions: ['mcd'],
      },
      'application/vnd.medcalcdata': {
        source: 'iana',
        extensions: ['mc1'],
      },
      'application/vnd.mediastation.cdkey': {
        source: 'iana',
        extensions: ['cdkey'],
      },
      'application/vnd.meridian-slingshot': {
        source: 'iana',
      },
      'application/vnd.mfer': {
        source: 'iana',
        extensions: ['mwf'],
      },
      'application/vnd.mfmp': {
        source: 'iana',
        extensions: ['mfm'],
      },
      'application/vnd.micro+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.micrografx.flo': {
        source: 'iana',
        extensions: ['flo'],
      },
      'application/vnd.micrografx.igx': {
        source: 'iana',
        extensions: ['igx'],
      },
      'application/vnd.microsoft.portable-executable': {
        source: 'iana',
      },
      'application/vnd.microsoft.windows.thumbnail-cache': {
        source: 'iana',
      },
      'application/vnd.miele+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.mif': {
        source: 'iana',
        extensions: ['mif'],
      },
      'application/vnd.minisoft-hp3000-save': {
        source: 'iana',
      },
      'application/vnd.mitsubishi.misty-guard.trustweb': {
        source: 'iana',
      },
      'application/vnd.mobius.daf': {
        source: 'iana',
        extensions: ['daf'],
      },
      'application/vnd.mobius.dis': {
        source: 'iana',
        extensions: ['dis'],
      },
      'application/vnd.mobius.mbk': {
        source: 'iana',
        extensions: ['mbk'],
      },
      'application/vnd.mobius.mqy': {
        source: 'iana',
        extensions: ['mqy'],
      },
      'application/vnd.mobius.msl': {
        source: 'iana',
        extensions: ['msl'],
      },
      'application/vnd.mobius.plc': {
        source: 'iana',
        extensions: ['plc'],
      },
      'application/vnd.mobius.txf': {
        source: 'iana',
        extensions: ['txf'],
      },
      'application/vnd.mophun.application': {
        source: 'iana',
        extensions: ['mpn'],
      },
      'application/vnd.mophun.certificate': {
        source: 'iana',
        extensions: ['mpc'],
      },
      'application/vnd.motorola.flexsuite': {
        source: 'iana',
      },
      'application/vnd.motorola.flexsuite.adsi': {
        source: 'iana',
      },
      'application/vnd.motorola.flexsuite.fis': {
        source: 'iana',
      },
      'application/vnd.motorola.flexsuite.gotap': {
        source: 'iana',
      },
      'application/vnd.motorola.flexsuite.kmr': {
        source: 'iana',
      },
      'application/vnd.motorola.flexsuite.ttc': {
        source: 'iana',
      },
      'application/vnd.motorola.flexsuite.wem': {
        source: 'iana',
      },
      'application/vnd.motorola.iprm': {
        source: 'iana',
      },
      'application/vnd.mozilla.xul+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xul'],
      },
      'application/vnd.ms-3mfdocument': {
        source: 'iana',
      },
      'application/vnd.ms-artgalry': {
        source: 'iana',
        extensions: ['cil'],
      },
      'application/vnd.ms-asf': {
        source: 'iana',
      },
      'application/vnd.ms-cab-compressed': {
        source: 'iana',
        extensions: ['cab'],
      },
      'application/vnd.ms-color.iccprofile': {
        source: 'apache',
      },
      'application/vnd.ms-excel': {
        source: 'iana',
        compressible: false,
        extensions: ['xls', 'xlm', 'xla', 'xlc', 'xlt', 'xlw'],
      },
      'application/vnd.ms-excel.addin.macroenabled.12': {
        source: 'iana',
        extensions: ['xlam'],
      },
      'application/vnd.ms-excel.sheet.binary.macroenabled.12': {
        source: 'iana',
        extensions: ['xlsb'],
      },
      'application/vnd.ms-excel.sheet.macroenabled.12': {
        source: 'iana',
        extensions: ['xlsm'],
      },
      'application/vnd.ms-excel.template.macroenabled.12': {
        source: 'iana',
        extensions: ['xltm'],
      },
      'application/vnd.ms-fontobject': {
        source: 'iana',
        compressible: true,
        extensions: ['eot'],
      },
      'application/vnd.ms-htmlhelp': {
        source: 'iana',
        extensions: ['chm'],
      },
      'application/vnd.ms-ims': {
        source: 'iana',
        extensions: ['ims'],
      },
      'application/vnd.ms-lrm': {
        source: 'iana',
        extensions: ['lrm'],
      },
      'application/vnd.ms-office.activex+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ms-officetheme': {
        source: 'iana',
        extensions: ['thmx'],
      },
      'application/vnd.ms-opentype': {
        source: 'apache',
        compressible: true,
      },
      'application/vnd.ms-outlook': {
        compressible: false,
        extensions: ['msg'],
      },
      'application/vnd.ms-package.obfuscated-opentype': {
        source: 'apache',
      },
      'application/vnd.ms-pki.seccat': {
        source: 'apache',
        extensions: ['cat'],
      },
      'application/vnd.ms-pki.stl': {
        source: 'apache',
        extensions: ['stl'],
      },
      'application/vnd.ms-playready.initiator+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ms-powerpoint': {
        source: 'iana',
        compressible: false,
        extensions: ['ppt', 'pps', 'pot'],
      },
      'application/vnd.ms-powerpoint.addin.macroenabled.12': {
        source: 'iana',
        extensions: ['ppam'],
      },
      'application/vnd.ms-powerpoint.presentation.macroenabled.12': {
        source: 'iana',
        extensions: ['pptm'],
      },
      'application/vnd.ms-powerpoint.slide.macroenabled.12': {
        source: 'iana',
        extensions: ['sldm'],
      },
      'application/vnd.ms-powerpoint.slideshow.macroenabled.12': {
        source: 'iana',
        extensions: ['ppsm'],
      },
      'application/vnd.ms-powerpoint.template.macroenabled.12': {
        source: 'iana',
        extensions: ['potm'],
      },
      'application/vnd.ms-printdevicecapabilities+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ms-printing.printticket+xml': {
        source: 'apache',
        compressible: true,
      },
      'application/vnd.ms-printschematicket+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.ms-project': {
        source: 'iana',
        extensions: ['mpp', 'mpt'],
      },
      'application/vnd.ms-tnef': {
        source: 'iana',
      },
      'application/vnd.ms-windows.devicepairing': {
        source: 'iana',
      },
      'application/vnd.ms-windows.nwprinting.oob': {
        source: 'iana',
      },
      'application/vnd.ms-windows.printerpairing': {
        source: 'iana',
      },
      'application/vnd.ms-windows.wsd.oob': {
        source: 'iana',
      },
      'application/vnd.ms-wmdrm.lic-chlg-req': {
        source: 'iana',
      },
      'application/vnd.ms-wmdrm.lic-resp': {
        source: 'iana',
      },
      'application/vnd.ms-wmdrm.meter-chlg-req': {
        source: 'iana',
      },
      'application/vnd.ms-wmdrm.meter-resp': {
        source: 'iana',
      },
      'application/vnd.ms-word.document.macroenabled.12': {
        source: 'iana',
        extensions: ['docm'],
      },
      'application/vnd.ms-word.template.macroenabled.12': {
        source: 'iana',
        extensions: ['dotm'],
      },
      'application/vnd.ms-works': {
        source: 'iana',
        extensions: ['wps', 'wks', 'wcm', 'wdb'],
      },
      'application/vnd.ms-wpl': {
        source: 'iana',
        extensions: ['wpl'],
      },
      'application/vnd.ms-xpsdocument': {
        source: 'iana',
        compressible: false,
        extensions: ['xps'],
      },
      'application/vnd.msa-disk-image': {
        source: 'iana',
      },
      'application/vnd.mseq': {
        source: 'iana',
        extensions: ['mseq'],
      },
      'application/vnd.msign': {
        source: 'iana',
      },
      'application/vnd.multiad.creator': {
        source: 'iana',
      },
      'application/vnd.multiad.creator.cif': {
        source: 'iana',
      },
      'application/vnd.music-niff': {
        source: 'iana',
      },
      'application/vnd.musician': {
        source: 'iana',
        extensions: ['mus'],
      },
      'application/vnd.muvee.style': {
        source: 'iana',
        extensions: ['msty'],
      },
      'application/vnd.mynfc': {
        source: 'iana',
        extensions: ['taglet'],
      },
      'application/vnd.ncd.control': {
        source: 'iana',
      },
      'application/vnd.ncd.reference': {
        source: 'iana',
      },
      'application/vnd.nearst.inv+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.nebumind.line': {
        source: 'iana',
      },
      'application/vnd.nervana': {
        source: 'iana',
      },
      'application/vnd.netfpx': {
        source: 'iana',
      },
      'application/vnd.neurolanguage.nlu': {
        source: 'iana',
        extensions: ['nlu'],
      },
      'application/vnd.nimn': {
        source: 'iana',
      },
      'application/vnd.nintendo.nitro.rom': {
        source: 'iana',
      },
      'application/vnd.nintendo.snes.rom': {
        source: 'iana',
      },
      'application/vnd.nitf': {
        source: 'iana',
        extensions: ['ntf', 'nitf'],
      },
      'application/vnd.noblenet-directory': {
        source: 'iana',
        extensions: ['nnd'],
      },
      'application/vnd.noblenet-sealer': {
        source: 'iana',
        extensions: ['nns'],
      },
      'application/vnd.noblenet-web': {
        source: 'iana',
        extensions: ['nnw'],
      },
      'application/vnd.nokia.catalogs': {
        source: 'iana',
      },
      'application/vnd.nokia.conml+wbxml': {
        source: 'iana',
      },
      'application/vnd.nokia.conml+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.nokia.iptv.config+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.nokia.isds-radio-presets': {
        source: 'iana',
      },
      'application/vnd.nokia.landmark+wbxml': {
        source: 'iana',
      },
      'application/vnd.nokia.landmark+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.nokia.landmarkcollection+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.nokia.n-gage.ac+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['ac'],
      },
      'application/vnd.nokia.n-gage.data': {
        source: 'iana',
        extensions: ['ngdat'],
      },
      'application/vnd.nokia.n-gage.symbian.install': {
        source: 'iana',
        extensions: ['n-gage'],
      },
      'application/vnd.nokia.ncd': {
        source: 'iana',
      },
      'application/vnd.nokia.pcd+wbxml': {
        source: 'iana',
      },
      'application/vnd.nokia.pcd+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.nokia.radio-preset': {
        source: 'iana',
        extensions: ['rpst'],
      },
      'application/vnd.nokia.radio-presets': {
        source: 'iana',
        extensions: ['rpss'],
      },
      'application/vnd.novadigm.edm': {
        source: 'iana',
        extensions: ['edm'],
      },
      'application/vnd.novadigm.edx': {
        source: 'iana',
        extensions: ['edx'],
      },
      'application/vnd.novadigm.ext': {
        source: 'iana',
        extensions: ['ext'],
      },
      'application/vnd.ntt-local.content-share': {
        source: 'iana',
      },
      'application/vnd.ntt-local.file-transfer': {
        source: 'iana',
      },
      'application/vnd.ntt-local.ogw_remote-access': {
        source: 'iana',
      },
      'application/vnd.ntt-local.sip-ta_remote': {
        source: 'iana',
      },
      'application/vnd.ntt-local.sip-ta_tcp_stream': {
        source: 'iana',
      },
      'application/vnd.oasis.opendocument.chart': {
        source: 'iana',
        extensions: ['odc'],
      },
      'application/vnd.oasis.opendocument.chart-template': {
        source: 'iana',
        extensions: ['otc'],
      },
      'application/vnd.oasis.opendocument.database': {
        source: 'iana',
        extensions: ['odb'],
      },
      'application/vnd.oasis.opendocument.formula': {
        source: 'iana',
        extensions: ['odf'],
      },
      'application/vnd.oasis.opendocument.formula-template': {
        source: 'iana',
        extensions: ['odft'],
      },
      'application/vnd.oasis.opendocument.graphics': {
        source: 'iana',
        compressible: false,
        extensions: ['odg'],
      },
      'application/vnd.oasis.opendocument.graphics-template': {
        source: 'iana',
        extensions: ['otg'],
      },
      'application/vnd.oasis.opendocument.image': {
        source: 'iana',
        extensions: ['odi'],
      },
      'application/vnd.oasis.opendocument.image-template': {
        source: 'iana',
        extensions: ['oti'],
      },
      'application/vnd.oasis.opendocument.presentation': {
        source: 'iana',
        compressible: false,
        extensions: ['odp'],
      },
      'application/vnd.oasis.opendocument.presentation-template': {
        source: 'iana',
        extensions: ['otp'],
      },
      'application/vnd.oasis.opendocument.spreadsheet': {
        source: 'iana',
        compressible: false,
        extensions: ['ods'],
      },
      'application/vnd.oasis.opendocument.spreadsheet-template': {
        source: 'iana',
        extensions: ['ots'],
      },
      'application/vnd.oasis.opendocument.text': {
        source: 'iana',
        compressible: false,
        extensions: ['odt'],
      },
      'application/vnd.oasis.opendocument.text-master': {
        source: 'iana',
        extensions: ['odm'],
      },
      'application/vnd.oasis.opendocument.text-template': {
        source: 'iana',
        extensions: ['ott'],
      },
      'application/vnd.oasis.opendocument.text-web': {
        source: 'iana',
        extensions: ['oth'],
      },
      'application/vnd.obn': {
        source: 'iana',
      },
      'application/vnd.ocf+cbor': {
        source: 'iana',
      },
      'application/vnd.oci.image.manifest.v1+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oftn.l10n+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oipf.contentaccessdownload+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oipf.contentaccessstreaming+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oipf.cspg-hexbinary': {
        source: 'iana',
      },
      'application/vnd.oipf.dae.svg+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oipf.dae.xhtml+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oipf.mippvcontrolmessage+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oipf.pae.gem': {
        source: 'iana',
      },
      'application/vnd.oipf.spdiscovery+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oipf.spdlist+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oipf.ueprofile+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oipf.userprofile+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.olpc-sugar': {
        source: 'iana',
        extensions: ['xo'],
      },
      'application/vnd.oma-scws-config': {
        source: 'iana',
      },
      'application/vnd.oma-scws-http-request': {
        source: 'iana',
      },
      'application/vnd.oma-scws-http-response': {
        source: 'iana',
      },
      'application/vnd.oma.bcast.associated-procedure-parameter+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.bcast.drm-trigger+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.bcast.imd+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.bcast.ltkm': {
        source: 'iana',
      },
      'application/vnd.oma.bcast.notification+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.bcast.provisioningtrigger': {
        source: 'iana',
      },
      'application/vnd.oma.bcast.sgboot': {
        source: 'iana',
      },
      'application/vnd.oma.bcast.sgdd+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.bcast.sgdu': {
        source: 'iana',
      },
      'application/vnd.oma.bcast.simple-symbol-container': {
        source: 'iana',
      },
      'application/vnd.oma.bcast.smartcard-trigger+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.bcast.sprov+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.bcast.stkm': {
        source: 'iana',
      },
      'application/vnd.oma.cab-address-book+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.cab-feature-handler+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.cab-pcc+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.cab-subs-invite+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.cab-user-prefs+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.dcd': {
        source: 'iana',
      },
      'application/vnd.oma.dcdc': {
        source: 'iana',
      },
      'application/vnd.oma.dd2+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['dd2'],
      },
      'application/vnd.oma.drm.risd+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.group-usage-list+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.lwm2m+cbor': {
        source: 'iana',
      },
      'application/vnd.oma.lwm2m+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.lwm2m+tlv': {
        source: 'iana',
      },
      'application/vnd.oma.pal+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.poc.detailed-progress-report+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.poc.final-report+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.poc.groups+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.poc.invocation-descriptor+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.poc.optimized-progress-report+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.push': {
        source: 'iana',
      },
      'application/vnd.oma.scidm.messages+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oma.xcap-directory+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.omads-email+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/vnd.omads-file+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/vnd.omads-folder+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/vnd.omaloc-supl-init': {
        source: 'iana',
      },
      'application/vnd.onepager': {
        source: 'iana',
      },
      'application/vnd.onepagertamp': {
        source: 'iana',
      },
      'application/vnd.onepagertamx': {
        source: 'iana',
      },
      'application/vnd.onepagertat': {
        source: 'iana',
      },
      'application/vnd.onepagertatp': {
        source: 'iana',
      },
      'application/vnd.onepagertatx': {
        source: 'iana',
      },
      'application/vnd.openblox.game+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['obgx'],
      },
      'application/vnd.openblox.game-binary': {
        source: 'iana',
      },
      'application/vnd.openeye.oeb': {
        source: 'iana',
      },
      'application/vnd.openofficeorg.extension': {
        source: 'apache',
        extensions: ['oxt'],
      },
      'application/vnd.openstreetmap.data+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['osm'],
      },
      'application/vnd.openxmlformats-officedocument.custom-properties+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.customxmlproperties+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.drawing+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.drawingml.chart+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.extended-properties+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.comments+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
        source: 'iana',
        compressible: false,
        extensions: ['pptx'],
      },
      'application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.presprops+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.slide': {
        source: 'iana',
        extensions: ['sldx'],
      },
      'application/vnd.openxmlformats-officedocument.presentationml.slide+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow': {
        source: 'iana',
        extensions: ['ppsx'],
      },
      'application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.tags+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.template': {
        source: 'iana',
        extensions: ['potx'],
      },
      'application/vnd.openxmlformats-officedocument.presentationml.template.main+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        source: 'iana',
        compressible: false,
        extensions: ['xlsx'],
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template': {
        source: 'iana',
        extensions: ['xltx'],
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.theme+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.themeoverride+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.vmldrawing': {
        source: 'iana',
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        source: 'iana',
        compressible: false,
        extensions: ['docx'],
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.template': {
        source: 'iana',
        extensions: ['dotx'],
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-package.core-properties+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.openxmlformats-package.relationships+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oracle.resource+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.orange.indata': {
        source: 'iana',
      },
      'application/vnd.osa.netdeploy': {
        source: 'iana',
      },
      'application/vnd.osgeo.mapguide.package': {
        source: 'iana',
        extensions: ['mgp'],
      },
      'application/vnd.osgi.bundle': {
        source: 'iana',
      },
      'application/vnd.osgi.dp': {
        source: 'iana',
        extensions: ['dp'],
      },
      'application/vnd.osgi.subsystem': {
        source: 'iana',
        extensions: ['esa'],
      },
      'application/vnd.otps.ct-kip+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.oxli.countgraph': {
        source: 'iana',
      },
      'application/vnd.pagerduty+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.palm': {
        source: 'iana',
        extensions: ['pdb', 'pqa', 'oprc'],
      },
      'application/vnd.panoply': {
        source: 'iana',
      },
      'application/vnd.paos.xml': {
        source: 'iana',
      },
      'application/vnd.patentdive': {
        source: 'iana',
      },
      'application/vnd.patientecommsdoc': {
        source: 'iana',
      },
      'application/vnd.pawaafile': {
        source: 'iana',
        extensions: ['paw'],
      },
      'application/vnd.pcos': {
        source: 'iana',
      },
      'application/vnd.pg.format': {
        source: 'iana',
        extensions: ['str'],
      },
      'application/vnd.pg.osasli': {
        source: 'iana',
        extensions: ['ei6'],
      },
      'application/vnd.piaccess.application-licence': {
        source: 'iana',
      },
      'application/vnd.picsel': {
        source: 'iana',
        extensions: ['efif'],
      },
      'application/vnd.pmi.widget': {
        source: 'iana',
        extensions: ['wg'],
      },
      'application/vnd.poc.group-advertisement+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.pocketlearn': {
        source: 'iana',
        extensions: ['plf'],
      },
      'application/vnd.powerbuilder6': {
        source: 'iana',
        extensions: ['pbd'],
      },
      'application/vnd.powerbuilder6-s': {
        source: 'iana',
      },
      'application/vnd.powerbuilder7': {
        source: 'iana',
      },
      'application/vnd.powerbuilder7-s': {
        source: 'iana',
      },
      'application/vnd.powerbuilder75': {
        source: 'iana',
      },
      'application/vnd.powerbuilder75-s': {
        source: 'iana',
      },
      'application/vnd.preminet': {
        source: 'iana',
      },
      'application/vnd.previewsystems.box': {
        source: 'iana',
        extensions: ['box'],
      },
      'application/vnd.proteus.magazine': {
        source: 'iana',
        extensions: ['mgz'],
      },
      'application/vnd.psfs': {
        source: 'iana',
      },
      'application/vnd.publishare-delta-tree': {
        source: 'iana',
        extensions: ['qps'],
      },
      'application/vnd.pvi.ptid1': {
        source: 'iana',
        extensions: ['ptid'],
      },
      'application/vnd.pwg-multiplexed': {
        source: 'iana',
      },
      'application/vnd.pwg-xhtml-print+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.qualcomm.brew-app-res': {
        source: 'iana',
      },
      'application/vnd.quarantainenet': {
        source: 'iana',
      },
      'application/vnd.quark.quarkxpress': {
        source: 'iana',
        extensions: ['qxd', 'qxt', 'qwd', 'qwt', 'qxl', 'qxb'],
      },
      'application/vnd.quobject-quoxdocument': {
        source: 'iana',
      },
      'application/vnd.radisys.moml+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-audit+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-audit-conf+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-audit-conn+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-audit-dialog+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-audit-stream+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-conf+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-dialog+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-dialog-base+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-dialog-fax-detect+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-dialog-fax-sendrecv+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-dialog-group+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-dialog-speech+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.radisys.msml-dialog-transform+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.rainstor.data': {
        source: 'iana',
      },
      'application/vnd.rapid': {
        source: 'iana',
      },
      'application/vnd.rar': {
        source: 'iana',
        extensions: ['rar'],
      },
      'application/vnd.realvnc.bed': {
        source: 'iana',
        extensions: ['bed'],
      },
      'application/vnd.recordare.musicxml': {
        source: 'iana',
        extensions: ['mxl'],
      },
      'application/vnd.recordare.musicxml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['musicxml'],
      },
      'application/vnd.renlearn.rlprint': {
        source: 'iana',
      },
      'application/vnd.restful+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.rig.cryptonote': {
        source: 'iana',
        extensions: ['cryptonote'],
      },
      'application/vnd.rim.cod': {
        source: 'apache',
        extensions: ['cod'],
      },
      'application/vnd.rn-realmedia': {
        source: 'apache',
        extensions: ['rm'],
      },
      'application/vnd.rn-realmedia-vbr': {
        source: 'apache',
        extensions: ['rmvb'],
      },
      'application/vnd.route66.link66+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['link66'],
      },
      'application/vnd.rs-274x': {
        source: 'iana',
      },
      'application/vnd.ruckus.download': {
        source: 'iana',
      },
      'application/vnd.s3sms': {
        source: 'iana',
      },
      'application/vnd.sailingtracker.track': {
        source: 'iana',
        extensions: ['st'],
      },
      'application/vnd.sar': {
        source: 'iana',
      },
      'application/vnd.sbm.cid': {
        source: 'iana',
      },
      'application/vnd.sbm.mid2': {
        source: 'iana',
      },
      'application/vnd.scribus': {
        source: 'iana',
      },
      'application/vnd.sealed.3df': {
        source: 'iana',
      },
      'application/vnd.sealed.csf': {
        source: 'iana',
      },
      'application/vnd.sealed.doc': {
        source: 'iana',
      },
      'application/vnd.sealed.eml': {
        source: 'iana',
      },
      'application/vnd.sealed.mht': {
        source: 'iana',
      },
      'application/vnd.sealed.net': {
        source: 'iana',
      },
      'application/vnd.sealed.ppt': {
        source: 'iana',
      },
      'application/vnd.sealed.tiff': {
        source: 'iana',
      },
      'application/vnd.sealed.xls': {
        source: 'iana',
      },
      'application/vnd.sealedmedia.softseal.html': {
        source: 'iana',
      },
      'application/vnd.sealedmedia.softseal.pdf': {
        source: 'iana',
      },
      'application/vnd.seemail': {
        source: 'iana',
        extensions: ['see'],
      },
      'application/vnd.seis+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.sema': {
        source: 'iana',
        extensions: ['sema'],
      },
      'application/vnd.semd': {
        source: 'iana',
        extensions: ['semd'],
      },
      'application/vnd.semf': {
        source: 'iana',
        extensions: ['semf'],
      },
      'application/vnd.shade-save-file': {
        source: 'iana',
      },
      'application/vnd.shana.informed.formdata': {
        source: 'iana',
        extensions: ['ifm'],
      },
      'application/vnd.shana.informed.formtemplate': {
        source: 'iana',
        extensions: ['itp'],
      },
      'application/vnd.shana.informed.interchange': {
        source: 'iana',
        extensions: ['iif'],
      },
      'application/vnd.shana.informed.package': {
        source: 'iana',
        extensions: ['ipk'],
      },
      'application/vnd.shootproof+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.shopkick+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.shp': {
        source: 'iana',
      },
      'application/vnd.shx': {
        source: 'iana',
      },
      'application/vnd.sigrok.session': {
        source: 'iana',
      },
      'application/vnd.simtech-mindmapper': {
        source: 'iana',
        extensions: ['twd', 'twds'],
      },
      'application/vnd.siren+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.smaf': {
        source: 'iana',
        extensions: ['mmf'],
      },
      'application/vnd.smart.notebook': {
        source: 'iana',
      },
      'application/vnd.smart.teacher': {
        source: 'iana',
        extensions: ['teacher'],
      },
      'application/vnd.snesdev-page-table': {
        source: 'iana',
      },
      'application/vnd.software602.filler.form+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['fo'],
      },
      'application/vnd.software602.filler.form-xml-zip': {
        source: 'iana',
      },
      'application/vnd.solent.sdkm+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['sdkm', 'sdkd'],
      },
      'application/vnd.spotfire.dxp': {
        source: 'iana',
        extensions: ['dxp'],
      },
      'application/vnd.spotfire.sfs': {
        source: 'iana',
        extensions: ['sfs'],
      },
      'application/vnd.sqlite3': {
        source: 'iana',
      },
      'application/vnd.sss-cod': {
        source: 'iana',
      },
      'application/vnd.sss-dtf': {
        source: 'iana',
      },
      'application/vnd.sss-ntf': {
        source: 'iana',
      },
      'application/vnd.stardivision.calc': {
        source: 'apache',
        extensions: ['sdc'],
      },
      'application/vnd.stardivision.draw': {
        source: 'apache',
        extensions: ['sda'],
      },
      'application/vnd.stardivision.impress': {
        source: 'apache',
        extensions: ['sdd'],
      },
      'application/vnd.stardivision.math': {
        source: 'apache',
        extensions: ['smf'],
      },
      'application/vnd.stardivision.writer': {
        source: 'apache',
        extensions: ['sdw', 'vor'],
      },
      'application/vnd.stardivision.writer-global': {
        source: 'apache',
        extensions: ['sgl'],
      },
      'application/vnd.stepmania.package': {
        source: 'iana',
        extensions: ['smzip'],
      },
      'application/vnd.stepmania.stepchart': {
        source: 'iana',
        extensions: ['sm'],
      },
      'application/vnd.street-stream': {
        source: 'iana',
      },
      'application/vnd.sun.wadl+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['wadl'],
      },
      'application/vnd.sun.xml.calc': {
        source: 'apache',
        extensions: ['sxc'],
      },
      'application/vnd.sun.xml.calc.template': {
        source: 'apache',
        extensions: ['stc'],
      },
      'application/vnd.sun.xml.draw': {
        source: 'apache',
        extensions: ['sxd'],
      },
      'application/vnd.sun.xml.draw.template': {
        source: 'apache',
        extensions: ['std'],
      },
      'application/vnd.sun.xml.impress': {
        source: 'apache',
        extensions: ['sxi'],
      },
      'application/vnd.sun.xml.impress.template': {
        source: 'apache',
        extensions: ['sti'],
      },
      'application/vnd.sun.xml.math': {
        source: 'apache',
        extensions: ['sxm'],
      },
      'application/vnd.sun.xml.writer': {
        source: 'apache',
        extensions: ['sxw'],
      },
      'application/vnd.sun.xml.writer.global': {
        source: 'apache',
        extensions: ['sxg'],
      },
      'application/vnd.sun.xml.writer.template': {
        source: 'apache',
        extensions: ['stw'],
      },
      'application/vnd.sus-calendar': {
        source: 'iana',
        extensions: ['sus', 'susp'],
      },
      'application/vnd.svd': {
        source: 'iana',
        extensions: ['svd'],
      },
      'application/vnd.swiftview-ics': {
        source: 'iana',
      },
      'application/vnd.sycle+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.symbian.install': {
        source: 'apache',
        extensions: ['sis', 'sisx'],
      },
      'application/vnd.syncml+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
        extensions: ['xsm'],
      },
      'application/vnd.syncml.dm+wbxml': {
        source: 'iana',
        charset: 'UTF-8',
        extensions: ['bdm'],
      },
      'application/vnd.syncml.dm+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
        extensions: ['xdm'],
      },
      'application/vnd.syncml.dm.notification': {
        source: 'iana',
      },
      'application/vnd.syncml.dmddf+wbxml': {
        source: 'iana',
      },
      'application/vnd.syncml.dmddf+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
        extensions: ['ddf'],
      },
      'application/vnd.syncml.dmtnds+wbxml': {
        source: 'iana',
      },
      'application/vnd.syncml.dmtnds+xml': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
      },
      'application/vnd.syncml.ds.notification': {
        source: 'iana',
      },
      'application/vnd.tableschema+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.tao.intent-module-archive': {
        source: 'iana',
        extensions: ['tao'],
      },
      'application/vnd.tcpdump.pcap': {
        source: 'iana',
        extensions: ['pcap', 'cap', 'dmp'],
      },
      'application/vnd.think-cell.ppttc+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.tmd.mediaflex.api+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.tml': {
        source: 'iana',
      },
      'application/vnd.tmobile-livetv': {
        source: 'iana',
        extensions: ['tmo'],
      },
      'application/vnd.tri.onesource': {
        source: 'iana',
      },
      'application/vnd.trid.tpt': {
        source: 'iana',
        extensions: ['tpt'],
      },
      'application/vnd.triscape.mxs': {
        source: 'iana',
        extensions: ['mxs'],
      },
      'application/vnd.trueapp': {
        source: 'iana',
        extensions: ['tra'],
      },
      'application/vnd.truedoc': {
        source: 'iana',
      },
      'application/vnd.ubisoft.webplayer': {
        source: 'iana',
      },
      'application/vnd.ufdl': {
        source: 'iana',
        extensions: ['ufd', 'ufdl'],
      },
      'application/vnd.uiq.theme': {
        source: 'iana',
        extensions: ['utz'],
      },
      'application/vnd.umajin': {
        source: 'iana',
        extensions: ['umj'],
      },
      'application/vnd.unity': {
        source: 'iana',
        extensions: ['unityweb'],
      },
      'application/vnd.uoml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['uoml'],
      },
      'application/vnd.uplanet.alert': {
        source: 'iana',
      },
      'application/vnd.uplanet.alert-wbxml': {
        source: 'iana',
      },
      'application/vnd.uplanet.bearer-choice': {
        source: 'iana',
      },
      'application/vnd.uplanet.bearer-choice-wbxml': {
        source: 'iana',
      },
      'application/vnd.uplanet.cacheop': {
        source: 'iana',
      },
      'application/vnd.uplanet.cacheop-wbxml': {
        source: 'iana',
      },
      'application/vnd.uplanet.channel': {
        source: 'iana',
      },
      'application/vnd.uplanet.channel-wbxml': {
        source: 'iana',
      },
      'application/vnd.uplanet.list': {
        source: 'iana',
      },
      'application/vnd.uplanet.list-wbxml': {
        source: 'iana',
      },
      'application/vnd.uplanet.listcmd': {
        source: 'iana',
      },
      'application/vnd.uplanet.listcmd-wbxml': {
        source: 'iana',
      },
      'application/vnd.uplanet.signal': {
        source: 'iana',
      },
      'application/vnd.uri-map': {
        source: 'iana',
      },
      'application/vnd.valve.source.material': {
        source: 'iana',
      },
      'application/vnd.vcx': {
        source: 'iana',
        extensions: ['vcx'],
      },
      'application/vnd.vd-study': {
        source: 'iana',
      },
      'application/vnd.vectorworks': {
        source: 'iana',
      },
      'application/vnd.vel+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.verimatrix.vcas': {
        source: 'iana',
      },
      'application/vnd.veryant.thin': {
        source: 'iana',
      },
      'application/vnd.ves.encrypted': {
        source: 'iana',
      },
      'application/vnd.vidsoft.vidconference': {
        source: 'iana',
      },
      'application/vnd.visio': {
        source: 'iana',
        extensions: ['vsd', 'vst', 'vss', 'vsw'],
      },
      'application/vnd.visionary': {
        source: 'iana',
        extensions: ['vis'],
      },
      'application/vnd.vividence.scriptfile': {
        source: 'iana',
      },
      'application/vnd.vsf': {
        source: 'iana',
        extensions: ['vsf'],
      },
      'application/vnd.wap.sic': {
        source: 'iana',
      },
      'application/vnd.wap.slc': {
        source: 'iana',
      },
      'application/vnd.wap.wbxml': {
        source: 'iana',
        charset: 'UTF-8',
        extensions: ['wbxml'],
      },
      'application/vnd.wap.wmlc': {
        source: 'iana',
        extensions: ['wmlc'],
      },
      'application/vnd.wap.wmlscriptc': {
        source: 'iana',
        extensions: ['wmlsc'],
      },
      'application/vnd.webturbo': {
        source: 'iana',
        extensions: ['wtb'],
      },
      'application/vnd.wfa.dpp': {
        source: 'iana',
      },
      'application/vnd.wfa.p2p': {
        source: 'iana',
      },
      'application/vnd.wfa.wsc': {
        source: 'iana',
      },
      'application/vnd.windows.devicepairing': {
        source: 'iana',
      },
      'application/vnd.wmc': {
        source: 'iana',
      },
      'application/vnd.wmf.bootstrap': {
        source: 'iana',
      },
      'application/vnd.wolfram.mathematica': {
        source: 'iana',
      },
      'application/vnd.wolfram.mathematica.package': {
        source: 'iana',
      },
      'application/vnd.wolfram.player': {
        source: 'iana',
        extensions: ['nbp'],
      },
      'application/vnd.wordperfect': {
        source: 'iana',
        extensions: ['wpd'],
      },
      'application/vnd.wqd': {
        source: 'iana',
        extensions: ['wqd'],
      },
      'application/vnd.wrq-hp3000-labelled': {
        source: 'iana',
      },
      'application/vnd.wt.stf': {
        source: 'iana',
        extensions: ['stf'],
      },
      'application/vnd.wv.csp+wbxml': {
        source: 'iana',
      },
      'application/vnd.wv.csp+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.wv.ssp+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.xacml+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.xara': {
        source: 'iana',
        extensions: ['xar'],
      },
      'application/vnd.xfdl': {
        source: 'iana',
        extensions: ['xfdl'],
      },
      'application/vnd.xfdl.webform': {
        source: 'iana',
      },
      'application/vnd.xmi+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/vnd.xmpie.cpkg': {
        source: 'iana',
      },
      'application/vnd.xmpie.dpkg': {
        source: 'iana',
      },
      'application/vnd.xmpie.plan': {
        source: 'iana',
      },
      'application/vnd.xmpie.ppkg': {
        source: 'iana',
      },
      'application/vnd.xmpie.xlim': {
        source: 'iana',
      },
      'application/vnd.yamaha.hv-dic': {
        source: 'iana',
        extensions: ['hvd'],
      },
      'application/vnd.yamaha.hv-script': {
        source: 'iana',
        extensions: ['hvs'],
      },
      'application/vnd.yamaha.hv-voice': {
        source: 'iana',
        extensions: ['hvp'],
      },
      'application/vnd.yamaha.openscoreformat': {
        source: 'iana',
        extensions: ['osf'],
      },
      'application/vnd.yamaha.openscoreformat.osfpvg+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['osfpvg'],
      },
      'application/vnd.yamaha.remote-setup': {
        source: 'iana',
      },
      'application/vnd.yamaha.smaf-audio': {
        source: 'iana',
        extensions: ['saf'],
      },
      'application/vnd.yamaha.smaf-phrase': {
        source: 'iana',
        extensions: ['spf'],
      },
      'application/vnd.yamaha.through-ngn': {
        source: 'iana',
      },
      'application/vnd.yamaha.tunnel-udpencap': {
        source: 'iana',
      },
      'application/vnd.yaoweme': {
        source: 'iana',
      },
      'application/vnd.yellowriver-custom-menu': {
        source: 'iana',
        extensions: ['cmp'],
      },
      'application/vnd.youtube.yt': {
        source: 'iana',
      },
      'application/vnd.zul': {
        source: 'iana',
        extensions: ['zir', 'zirz'],
      },
      'application/vnd.zzazz.deck+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['zaz'],
      },
      'application/voicexml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['vxml'],
      },
      'application/voucher-cms+json': {
        source: 'iana',
        compressible: true,
      },
      'application/vq-rtcpxr': {
        source: 'iana',
      },
      'application/wasm': {
        compressible: true,
        extensions: ['wasm'],
      },
      'application/watcherinfo+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/webpush-options+json': {
        source: 'iana',
        compressible: true,
      },
      'application/whoispp-query': {
        source: 'iana',
      },
      'application/whoispp-response': {
        source: 'iana',
      },
      'application/widget': {
        source: 'iana',
        extensions: ['wgt'],
      },
      'application/winhlp': {
        source: 'apache',
        extensions: ['hlp'],
      },
      'application/wita': {
        source: 'iana',
      },
      'application/wordperfect5.1': {
        source: 'iana',
      },
      'application/wsdl+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['wsdl'],
      },
      'application/wspolicy+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['wspolicy'],
      },
      'application/x-7z-compressed': {
        source: 'apache',
        compressible: false,
        extensions: ['7z'],
      },
      'application/x-abiword': {
        source: 'apache',
        extensions: ['abw'],
      },
      'application/x-ace-compressed': {
        source: 'apache',
        extensions: ['ace'],
      },
      'application/x-amf': {
        source: 'apache',
      },
      'application/x-apple-diskimage': {
        source: 'apache',
        extensions: ['dmg'],
      },
      'application/x-arj': {
        compressible: false,
        extensions: ['arj'],
      },
      'application/x-authorware-bin': {
        source: 'apache',
        extensions: ['aab', 'x32', 'u32', 'vox'],
      },
      'application/x-authorware-map': {
        source: 'apache',
        extensions: ['aam'],
      },
      'application/x-authorware-seg': {
        source: 'apache',
        extensions: ['aas'],
      },
      'application/x-bcpio': {
        source: 'apache',
        extensions: ['bcpio'],
      },
      'application/x-bdoc': {
        compressible: false,
        extensions: ['bdoc'],
      },
      'application/x-bittorrent': {
        source: 'apache',
        extensions: ['torrent'],
      },
      'application/x-blorb': {
        source: 'apache',
        extensions: ['blb', 'blorb'],
      },
      'application/x-bzip': {
        source: 'apache',
        compressible: false,
        extensions: ['bz'],
      },
      'application/x-bzip2': {
        source: 'apache',
        compressible: false,
        extensions: ['bz2', 'boz'],
      },
      'application/x-cbr': {
        source: 'apache',
        extensions: ['cbr', 'cba', 'cbt', 'cbz', 'cb7'],
      },
      'application/x-cdlink': {
        source: 'apache',
        extensions: ['vcd'],
      },
      'application/x-cfs-compressed': {
        source: 'apache',
        extensions: ['cfs'],
      },
      'application/x-chat': {
        source: 'apache',
        extensions: ['chat'],
      },
      'application/x-chess-pgn': {
        source: 'apache',
        extensions: ['pgn'],
      },
      'application/x-chrome-extension': {
        extensions: ['crx'],
      },
      'application/x-cocoa': {
        source: 'nginx',
        extensions: ['cco'],
      },
      'application/x-compress': {
        source: 'apache',
      },
      'application/x-conference': {
        source: 'apache',
        extensions: ['nsc'],
      },
      'application/x-cpio': {
        source: 'apache',
        extensions: ['cpio'],
      },
      'application/x-csh': {
        source: 'apache',
        extensions: ['csh'],
      },
      'application/x-deb': {
        compressible: false,
      },
      'application/x-debian-package': {
        source: 'apache',
        extensions: ['deb', 'udeb'],
      },
      'application/x-dgc-compressed': {
        source: 'apache',
        extensions: ['dgc'],
      },
      'application/x-director': {
        source: 'apache',
        extensions: ['dir', 'dcr', 'dxr', 'cst', 'cct', 'cxt', 'w3d', 'fgd', 'swa'],
      },
      'application/x-doom': {
        source: 'apache',
        extensions: ['wad'],
      },
      'application/x-dtbncx+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['ncx'],
      },
      'application/x-dtbook+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['dtb'],
      },
      'application/x-dtbresource+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['res'],
      },
      'application/x-dvi': {
        source: 'apache',
        compressible: false,
        extensions: ['dvi'],
      },
      'application/x-envoy': {
        source: 'apache',
        extensions: ['evy'],
      },
      'application/x-eva': {
        source: 'apache',
        extensions: ['eva'],
      },
      'application/x-font-bdf': {
        source: 'apache',
        extensions: ['bdf'],
      },
      'application/x-font-dos': {
        source: 'apache',
      },
      'application/x-font-framemaker': {
        source: 'apache',
      },
      'application/x-font-ghostscript': {
        source: 'apache',
        extensions: ['gsf'],
      },
      'application/x-font-libgrx': {
        source: 'apache',
      },
      'application/x-font-linux-psf': {
        source: 'apache',
        extensions: ['psf'],
      },
      'application/x-font-pcf': {
        source: 'apache',
        extensions: ['pcf'],
      },
      'application/x-font-snf': {
        source: 'apache',
        extensions: ['snf'],
      },
      'application/x-font-speedo': {
        source: 'apache',
      },
      'application/x-font-sunos-news': {
        source: 'apache',
      },
      'application/x-font-type1': {
        source: 'apache',
        extensions: ['pfa', 'pfb', 'pfm', 'afm'],
      },
      'application/x-font-vfont': {
        source: 'apache',
      },
      'application/x-freearc': {
        source: 'apache',
        extensions: ['arc'],
      },
      'application/x-futuresplash': {
        source: 'apache',
        extensions: ['spl'],
      },
      'application/x-gca-compressed': {
        source: 'apache',
        extensions: ['gca'],
      },
      'application/x-glulx': {
        source: 'apache',
        extensions: ['ulx'],
      },
      'application/x-gnumeric': {
        source: 'apache',
        extensions: ['gnumeric'],
      },
      'application/x-gramps-xml': {
        source: 'apache',
        extensions: ['gramps'],
      },
      'application/x-gtar': {
        source: 'apache',
        extensions: ['gtar'],
      },
      'application/x-gzip': {
        source: 'apache',
      },
      'application/x-hdf': {
        source: 'apache',
        extensions: ['hdf'],
      },
      'application/x-httpd-php': {
        compressible: true,
        extensions: ['php'],
      },
      'application/x-install-instructions': {
        source: 'apache',
        extensions: ['install'],
      },
      'application/x-iso9660-image': {
        source: 'apache',
        extensions: ['iso'],
      },
      'application/x-java-archive-diff': {
        source: 'nginx',
        extensions: ['jardiff'],
      },
      'application/x-java-jnlp-file': {
        source: 'apache',
        compressible: false,
        extensions: ['jnlp'],
      },
      'application/x-javascript': {
        compressible: true,
      },
      'application/x-keepass2': {
        extensions: ['kdbx'],
      },
      'application/x-latex': {
        source: 'apache',
        compressible: false,
        extensions: ['latex'],
      },
      'application/x-lua-bytecode': {
        extensions: ['luac'],
      },
      'application/x-lzh-compressed': {
        source: 'apache',
        extensions: ['lzh', 'lha'],
      },
      'application/x-makeself': {
        source: 'nginx',
        extensions: ['run'],
      },
      'application/x-mie': {
        source: 'apache',
        extensions: ['mie'],
      },
      'application/x-mobipocket-ebook': {
        source: 'apache',
        extensions: ['prc', 'mobi'],
      },
      'application/x-mpegurl': {
        compressible: false,
      },
      'application/x-ms-application': {
        source: 'apache',
        extensions: ['application'],
      },
      'application/x-ms-shortcut': {
        source: 'apache',
        extensions: ['lnk'],
      },
      'application/x-ms-wmd': {
        source: 'apache',
        extensions: ['wmd'],
      },
      'application/x-ms-wmz': {
        source: 'apache',
        extensions: ['wmz'],
      },
      'application/x-ms-xbap': {
        source: 'apache',
        extensions: ['xbap'],
      },
      'application/x-msaccess': {
        source: 'apache',
        extensions: ['mdb'],
      },
      'application/x-msbinder': {
        source: 'apache',
        extensions: ['obd'],
      },
      'application/x-mscardfile': {
        source: 'apache',
        extensions: ['crd'],
      },
      'application/x-msclip': {
        source: 'apache',
        extensions: ['clp'],
      },
      'application/x-msdos-program': {
        extensions: ['exe'],
      },
      'application/x-msdownload': {
        source: 'apache',
        extensions: ['exe', 'dll', 'com', 'bat', 'msi'],
      },
      'application/x-msmediaview': {
        source: 'apache',
        extensions: ['mvb', 'm13', 'm14'],
      },
      'application/x-msmetafile': {
        source: 'apache',
        extensions: ['wmf', 'wmz', 'emf', 'emz'],
      },
      'application/x-msmoney': {
        source: 'apache',
        extensions: ['mny'],
      },
      'application/x-mspublisher': {
        source: 'apache',
        extensions: ['pub'],
      },
      'application/x-msschedule': {
        source: 'apache',
        extensions: ['scd'],
      },
      'application/x-msterminal': {
        source: 'apache',
        extensions: ['trm'],
      },
      'application/x-mswrite': {
        source: 'apache',
        extensions: ['wri'],
      },
      'application/x-netcdf': {
        source: 'apache',
        extensions: ['nc', 'cdf'],
      },
      'application/x-ns-proxy-autoconfig': {
        compressible: true,
        extensions: ['pac'],
      },
      'application/x-nzb': {
        source: 'apache',
        extensions: ['nzb'],
      },
      'application/x-perl': {
        source: 'nginx',
        extensions: ['pl', 'pm'],
      },
      'application/x-pilot': {
        source: 'nginx',
        extensions: ['prc', 'pdb'],
      },
      'application/x-pkcs12': {
        source: 'apache',
        compressible: false,
        extensions: ['p12', 'pfx'],
      },
      'application/x-pkcs7-certificates': {
        source: 'apache',
        extensions: ['p7b', 'spc'],
      },
      'application/x-pkcs7-certreqresp': {
        source: 'apache',
        extensions: ['p7r'],
      },
      'application/x-pki-message': {
        source: 'iana',
      },
      'application/x-rar-compressed': {
        source: 'apache',
        compressible: false,
        extensions: ['rar'],
      },
      'application/x-redhat-package-manager': {
        source: 'nginx',
        extensions: ['rpm'],
      },
      'application/x-research-info-systems': {
        source: 'apache',
        extensions: ['ris'],
      },
      'application/x-sea': {
        source: 'nginx',
        extensions: ['sea'],
      },
      'application/x-sh': {
        source: 'apache',
        compressible: true,
        extensions: ['sh'],
      },
      'application/x-shar': {
        source: 'apache',
        extensions: ['shar'],
      },
      'application/x-shockwave-flash': {
        source: 'apache',
        compressible: false,
        extensions: ['swf'],
      },
      'application/x-silverlight-app': {
        source: 'apache',
        extensions: ['xap'],
      },
      'application/x-sql': {
        source: 'apache',
        extensions: ['sql'],
      },
      'application/x-stuffit': {
        source: 'apache',
        compressible: false,
        extensions: ['sit'],
      },
      'application/x-stuffitx': {
        source: 'apache',
        extensions: ['sitx'],
      },
      'application/x-subrip': {
        source: 'apache',
        extensions: ['srt'],
      },
      'application/x-sv4cpio': {
        source: 'apache',
        extensions: ['sv4cpio'],
      },
      'application/x-sv4crc': {
        source: 'apache',
        extensions: ['sv4crc'],
      },
      'application/x-t3vm-image': {
        source: 'apache',
        extensions: ['t3'],
      },
      'application/x-tads': {
        source: 'apache',
        extensions: ['gam'],
      },
      'application/x-tar': {
        source: 'apache',
        compressible: true,
        extensions: ['tar'],
      },
      'application/x-tcl': {
        source: 'apache',
        extensions: ['tcl', 'tk'],
      },
      'application/x-tex': {
        source: 'apache',
        extensions: ['tex'],
      },
      'application/x-tex-tfm': {
        source: 'apache',
        extensions: ['tfm'],
      },
      'application/x-texinfo': {
        source: 'apache',
        extensions: ['texinfo', 'texi'],
      },
      'application/x-tgif': {
        source: 'apache',
        extensions: ['obj'],
      },
      'application/x-ustar': {
        source: 'apache',
        extensions: ['ustar'],
      },
      'application/x-virtualbox-hdd': {
        compressible: true,
        extensions: ['hdd'],
      },
      'application/x-virtualbox-ova': {
        compressible: true,
        extensions: ['ova'],
      },
      'application/x-virtualbox-ovf': {
        compressible: true,
        extensions: ['ovf'],
      },
      'application/x-virtualbox-vbox': {
        compressible: true,
        extensions: ['vbox'],
      },
      'application/x-virtualbox-vbox-extpack': {
        compressible: false,
        extensions: ['vbox-extpack'],
      },
      'application/x-virtualbox-vdi': {
        compressible: true,
        extensions: ['vdi'],
      },
      'application/x-virtualbox-vhd': {
        compressible: true,
        extensions: ['vhd'],
      },
      'application/x-virtualbox-vmdk': {
        compressible: true,
        extensions: ['vmdk'],
      },
      'application/x-wais-source': {
        source: 'apache',
        extensions: ['src'],
      },
      'application/x-web-app-manifest+json': {
        compressible: true,
        extensions: ['webapp'],
      },
      'application/x-www-form-urlencoded': {
        source: 'iana',
        compressible: true,
      },
      'application/x-x509-ca-cert': {
        source: 'iana',
        extensions: ['der', 'crt', 'pem'],
      },
      'application/x-x509-ca-ra-cert': {
        source: 'iana',
      },
      'application/x-x509-next-ca-cert': {
        source: 'iana',
      },
      'application/x-xfig': {
        source: 'apache',
        extensions: ['fig'],
      },
      'application/x-xliff+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['xlf'],
      },
      'application/x-xpinstall': {
        source: 'apache',
        compressible: false,
        extensions: ['xpi'],
      },
      'application/x-xz': {
        source: 'apache',
        extensions: ['xz'],
      },
      'application/x-zmachine': {
        source: 'apache',
        extensions: ['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7', 'z8'],
      },
      'application/x400-bp': {
        source: 'iana',
      },
      'application/xacml+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/xaml+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['xaml'],
      },
      'application/xcap-att+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xav'],
      },
      'application/xcap-caps+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xca'],
      },
      'application/xcap-diff+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xdf'],
      },
      'application/xcap-el+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xel'],
      },
      'application/xcap-error+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/xcap-ns+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xns'],
      },
      'application/xcon-conference-info+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/xcon-conference-info-diff+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/xenc+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xenc'],
      },
      'application/xhtml+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xhtml', 'xht'],
      },
      'application/xhtml-voice+xml': {
        source: 'apache',
        compressible: true,
      },
      'application/xliff+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xlf'],
      },
      'application/xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xml', 'xsl', 'xsd', 'rng'],
      },
      'application/xml-dtd': {
        source: 'iana',
        compressible: true,
        extensions: ['dtd'],
      },
      'application/xml-external-parsed-entity': {
        source: 'iana',
      },
      'application/xml-patch+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/xmpp+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/xop+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xop'],
      },
      'application/xproc+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['xpl'],
      },
      'application/xslt+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xsl', 'xslt'],
      },
      'application/xspf+xml': {
        source: 'apache',
        compressible: true,
        extensions: ['xspf'],
      },
      'application/xv+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['mxml', 'xhvml', 'xvml', 'xvm'],
      },
      'application/yang': {
        source: 'iana',
        extensions: ['yang'],
      },
      'application/yang-data+json': {
        source: 'iana',
        compressible: true,
      },
      'application/yang-data+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/yang-patch+json': {
        source: 'iana',
        compressible: true,
      },
      'application/yang-patch+xml': {
        source: 'iana',
        compressible: true,
      },
      'application/yin+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['yin'],
      },
      'application/zip': {
        source: 'iana',
        compressible: false,
        extensions: ['zip'],
      },
      'application/zlib': {
        source: 'iana',
      },
      'application/zstd': {
        source: 'iana',
      },
      'audio/1d-interleaved-parityfec': {
        source: 'iana',
      },
      'audio/32kadpcm': {
        source: 'iana',
      },
      'audio/3gpp': {
        source: 'iana',
        compressible: false,
        extensions: ['3gpp'],
      },
      'audio/3gpp2': {
        source: 'iana',
      },
      'audio/aac': {
        source: 'iana',
      },
      'audio/ac3': {
        source: 'iana',
      },
      'audio/adpcm': {
        source: 'apache',
        extensions: ['adp'],
      },
      'audio/amr': {
        source: 'iana',
        extensions: ['amr'],
      },
      'audio/amr-wb': {
        source: 'iana',
      },
      'audio/amr-wb+': {
        source: 'iana',
      },
      'audio/aptx': {
        source: 'iana',
      },
      'audio/asc': {
        source: 'iana',
      },
      'audio/atrac-advanced-lossless': {
        source: 'iana',
      },
      'audio/atrac-x': {
        source: 'iana',
      },
      'audio/atrac3': {
        source: 'iana',
      },
      'audio/basic': {
        source: 'iana',
        compressible: false,
        extensions: ['au', 'snd'],
      },
      'audio/bv16': {
        source: 'iana',
      },
      'audio/bv32': {
        source: 'iana',
      },
      'audio/clearmode': {
        source: 'iana',
      },
      'audio/cn': {
        source: 'iana',
      },
      'audio/dat12': {
        source: 'iana',
      },
      'audio/dls': {
        source: 'iana',
      },
      'audio/dsr-es201108': {
        source: 'iana',
      },
      'audio/dsr-es202050': {
        source: 'iana',
      },
      'audio/dsr-es202211': {
        source: 'iana',
      },
      'audio/dsr-es202212': {
        source: 'iana',
      },
      'audio/dv': {
        source: 'iana',
      },
      'audio/dvi4': {
        source: 'iana',
      },
      'audio/eac3': {
        source: 'iana',
      },
      'audio/encaprtp': {
        source: 'iana',
      },
      'audio/evrc': {
        source: 'iana',
      },
      'audio/evrc-qcp': {
        source: 'iana',
      },
      'audio/evrc0': {
        source: 'iana',
      },
      'audio/evrc1': {
        source: 'iana',
      },
      'audio/evrcb': {
        source: 'iana',
      },
      'audio/evrcb0': {
        source: 'iana',
      },
      'audio/evrcb1': {
        source: 'iana',
      },
      'audio/evrcnw': {
        source: 'iana',
      },
      'audio/evrcnw0': {
        source: 'iana',
      },
      'audio/evrcnw1': {
        source: 'iana',
      },
      'audio/evrcwb': {
        source: 'iana',
      },
      'audio/evrcwb0': {
        source: 'iana',
      },
      'audio/evrcwb1': {
        source: 'iana',
      },
      'audio/evs': {
        source: 'iana',
      },
      'audio/flexfec': {
        source: 'iana',
      },
      'audio/fwdred': {
        source: 'iana',
      },
      'audio/g711-0': {
        source: 'iana',
      },
      'audio/g719': {
        source: 'iana',
      },
      'audio/g722': {
        source: 'iana',
      },
      'audio/g7221': {
        source: 'iana',
      },
      'audio/g723': {
        source: 'iana',
      },
      'audio/g726-16': {
        source: 'iana',
      },
      'audio/g726-24': {
        source: 'iana',
      },
      'audio/g726-32': {
        source: 'iana',
      },
      'audio/g726-40': {
        source: 'iana',
      },
      'audio/g728': {
        source: 'iana',
      },
      'audio/g729': {
        source: 'iana',
      },
      'audio/g7291': {
        source: 'iana',
      },
      'audio/g729d': {
        source: 'iana',
      },
      'audio/g729e': {
        source: 'iana',
      },
      'audio/gsm': {
        source: 'iana',
      },
      'audio/gsm-efr': {
        source: 'iana',
      },
      'audio/gsm-hr-08': {
        source: 'iana',
      },
      'audio/ilbc': {
        source: 'iana',
      },
      'audio/ip-mr_v2.5': {
        source: 'iana',
      },
      'audio/isac': {
        source: 'apache',
      },
      'audio/l16': {
        source: 'iana',
      },
      'audio/l20': {
        source: 'iana',
      },
      'audio/l24': {
        source: 'iana',
        compressible: false,
      },
      'audio/l8': {
        source: 'iana',
      },
      'audio/lpc': {
        source: 'iana',
      },
      'audio/melp': {
        source: 'iana',
      },
      'audio/melp1200': {
        source: 'iana',
      },
      'audio/melp2400': {
        source: 'iana',
      },
      'audio/melp600': {
        source: 'iana',
      },
      'audio/mhas': {
        source: 'iana',
      },
      'audio/midi': {
        source: 'apache',
        extensions: ['mid', 'midi', 'kar', 'rmi'],
      },
      'audio/mobile-xmf': {
        source: 'iana',
        extensions: ['mxmf'],
      },
      'audio/mp3': {
        compressible: false,
        extensions: ['mp3'],
      },
      'audio/mp4': {
        source: 'iana',
        compressible: false,
        extensions: ['m4a', 'mp4a'],
      },
      'audio/mp4a-latm': {
        source: 'iana',
      },
      'audio/mpa': {
        source: 'iana',
      },
      'audio/mpa-robust': {
        source: 'iana',
      },
      'audio/mpeg': {
        source: 'iana',
        compressible: false,
        extensions: ['mpga', 'mp2', 'mp2a', 'mp3', 'm2a', 'm3a'],
      },
      'audio/mpeg4-generic': {
        source: 'iana',
      },
      'audio/musepack': {
        source: 'apache',
      },
      'audio/ogg': {
        source: 'iana',
        compressible: false,
        extensions: ['oga', 'ogg', 'spx', 'opus'],
      },
      'audio/opus': {
        source: 'iana',
      },
      'audio/parityfec': {
        source: 'iana',
      },
      'audio/pcma': {
        source: 'iana',
      },
      'audio/pcma-wb': {
        source: 'iana',
      },
      'audio/pcmu': {
        source: 'iana',
      },
      'audio/pcmu-wb': {
        source: 'iana',
      },
      'audio/prs.sid': {
        source: 'iana',
      },
      'audio/qcelp': {
        source: 'iana',
      },
      'audio/raptorfec': {
        source: 'iana',
      },
      'audio/red': {
        source: 'iana',
      },
      'audio/rtp-enc-aescm128': {
        source: 'iana',
      },
      'audio/rtp-midi': {
        source: 'iana',
      },
      'audio/rtploopback': {
        source: 'iana',
      },
      'audio/rtx': {
        source: 'iana',
      },
      'audio/s3m': {
        source: 'apache',
        extensions: ['s3m'],
      },
      'audio/scip': {
        source: 'iana',
      },
      'audio/silk': {
        source: 'apache',
        extensions: ['sil'],
      },
      'audio/smv': {
        source: 'iana',
      },
      'audio/smv-qcp': {
        source: 'iana',
      },
      'audio/smv0': {
        source: 'iana',
      },
      'audio/sofa': {
        source: 'iana',
      },
      'audio/sp-midi': {
        source: 'iana',
      },
      'audio/speex': {
        source: 'iana',
      },
      'audio/t140c': {
        source: 'iana',
      },
      'audio/t38': {
        source: 'iana',
      },
      'audio/telephone-event': {
        source: 'iana',
      },
      'audio/tetra_acelp': {
        source: 'iana',
      },
      'audio/tetra_acelp_bb': {
        source: 'iana',
      },
      'audio/tone': {
        source: 'iana',
      },
      'audio/tsvcis': {
        source: 'iana',
      },
      'audio/uemclip': {
        source: 'iana',
      },
      'audio/ulpfec': {
        source: 'iana',
      },
      'audio/usac': {
        source: 'iana',
      },
      'audio/vdvi': {
        source: 'iana',
      },
      'audio/vmr-wb': {
        source: 'iana',
      },
      'audio/vnd.3gpp.iufp': {
        source: 'iana',
      },
      'audio/vnd.4sb': {
        source: 'iana',
      },
      'audio/vnd.audiokoz': {
        source: 'iana',
      },
      'audio/vnd.celp': {
        source: 'iana',
      },
      'audio/vnd.cisco.nse': {
        source: 'iana',
      },
      'audio/vnd.cmles.radio-events': {
        source: 'iana',
      },
      'audio/vnd.cns.anp1': {
        source: 'iana',
      },
      'audio/vnd.cns.inf1': {
        source: 'iana',
      },
      'audio/vnd.dece.audio': {
        source: 'iana',
        extensions: ['uva', 'uvva'],
      },
      'audio/vnd.digital-winds': {
        source: 'iana',
        extensions: ['eol'],
      },
      'audio/vnd.dlna.adts': {
        source: 'iana',
      },
      'audio/vnd.dolby.heaac.1': {
        source: 'iana',
      },
      'audio/vnd.dolby.heaac.2': {
        source: 'iana',
      },
      'audio/vnd.dolby.mlp': {
        source: 'iana',
      },
      'audio/vnd.dolby.mps': {
        source: 'iana',
      },
      'audio/vnd.dolby.pl2': {
        source: 'iana',
      },
      'audio/vnd.dolby.pl2x': {
        source: 'iana',
      },
      'audio/vnd.dolby.pl2z': {
        source: 'iana',
      },
      'audio/vnd.dolby.pulse.1': {
        source: 'iana',
      },
      'audio/vnd.dra': {
        source: 'iana',
        extensions: ['dra'],
      },
      'audio/vnd.dts': {
        source: 'iana',
        extensions: ['dts'],
      },
      'audio/vnd.dts.hd': {
        source: 'iana',
        extensions: ['dtshd'],
      },
      'audio/vnd.dts.uhd': {
        source: 'iana',
      },
      'audio/vnd.dvb.file': {
        source: 'iana',
      },
      'audio/vnd.everad.plj': {
        source: 'iana',
      },
      'audio/vnd.hns.audio': {
        source: 'iana',
      },
      'audio/vnd.lucent.voice': {
        source: 'iana',
        extensions: ['lvp'],
      },
      'audio/vnd.ms-playready.media.pya': {
        source: 'iana',
        extensions: ['pya'],
      },
      'audio/vnd.nokia.mobile-xmf': {
        source: 'iana',
      },
      'audio/vnd.nortel.vbk': {
        source: 'iana',
      },
      'audio/vnd.nuera.ecelp4800': {
        source: 'iana',
        extensions: ['ecelp4800'],
      },
      'audio/vnd.nuera.ecelp7470': {
        source: 'iana',
        extensions: ['ecelp7470'],
      },
      'audio/vnd.nuera.ecelp9600': {
        source: 'iana',
        extensions: ['ecelp9600'],
      },
      'audio/vnd.octel.sbc': {
        source: 'iana',
      },
      'audio/vnd.presonus.multitrack': {
        source: 'iana',
      },
      'audio/vnd.qcelp': {
        source: 'iana',
      },
      'audio/vnd.rhetorex.32kadpcm': {
        source: 'iana',
      },
      'audio/vnd.rip': {
        source: 'iana',
        extensions: ['rip'],
      },
      'audio/vnd.rn-realaudio': {
        compressible: false,
      },
      'audio/vnd.sealedmedia.softseal.mpeg': {
        source: 'iana',
      },
      'audio/vnd.vmx.cvsd': {
        source: 'iana',
      },
      'audio/vnd.wave': {
        compressible: false,
      },
      'audio/vorbis': {
        source: 'iana',
        compressible: false,
      },
      'audio/vorbis-config': {
        source: 'iana',
      },
      'audio/wav': {
        compressible: false,
        extensions: ['wav'],
      },
      'audio/wave': {
        compressible: false,
        extensions: ['wav'],
      },
      'audio/webm': {
        source: 'apache',
        compressible: false,
        extensions: ['weba'],
      },
      'audio/x-aac': {
        source: 'apache',
        compressible: false,
        extensions: ['aac'],
      },
      'audio/x-aiff': {
        source: 'apache',
        extensions: ['aif', 'aiff', 'aifc'],
      },
      'audio/x-caf': {
        source: 'apache',
        compressible: false,
        extensions: ['caf'],
      },
      'audio/x-flac': {
        source: 'apache',
        extensions: ['flac'],
      },
      'audio/x-m4a': {
        source: 'nginx',
        extensions: ['m4a'],
      },
      'audio/x-matroska': {
        source: 'apache',
        extensions: ['mka'],
      },
      'audio/x-mpegurl': {
        source: 'apache',
        extensions: ['m3u'],
      },
      'audio/x-ms-wax': {
        source: 'apache',
        extensions: ['wax'],
      },
      'audio/x-ms-wma': {
        source: 'apache',
        extensions: ['wma'],
      },
      'audio/x-pn-realaudio': {
        source: 'apache',
        extensions: ['ram', 'ra'],
      },
      'audio/x-pn-realaudio-plugin': {
        source: 'apache',
        extensions: ['rmp'],
      },
      'audio/x-realaudio': {
        source: 'nginx',
        extensions: ['ra'],
      },
      'audio/x-tta': {
        source: 'apache',
      },
      'audio/x-wav': {
        source: 'apache',
        extensions: ['wav'],
      },
      'audio/xm': {
        source: 'apache',
        extensions: ['xm'],
      },
      'chemical/x-cdx': {
        source: 'apache',
        extensions: ['cdx'],
      },
      'chemical/x-cif': {
        source: 'apache',
        extensions: ['cif'],
      },
      'chemical/x-cmdf': {
        source: 'apache',
        extensions: ['cmdf'],
      },
      'chemical/x-cml': {
        source: 'apache',
        extensions: ['cml'],
      },
      'chemical/x-csml': {
        source: 'apache',
        extensions: ['csml'],
      },
      'chemical/x-pdb': {
        source: 'apache',
      },
      'chemical/x-xyz': {
        source: 'apache',
        extensions: ['xyz'],
      },
      'font/collection': {
        source: 'iana',
        extensions: ['ttc'],
      },
      'font/otf': {
        source: 'iana',
        compressible: true,
        extensions: ['otf'],
      },
      'font/sfnt': {
        source: 'iana',
      },
      'font/ttf': {
        source: 'iana',
        compressible: true,
        extensions: ['ttf'],
      },
      'font/woff': {
        source: 'iana',
        extensions: ['woff'],
      },
      'font/woff2': {
        source: 'iana',
        extensions: ['woff2'],
      },
      'image/aces': {
        source: 'iana',
        extensions: ['exr'],
      },
      'image/apng': {
        compressible: false,
        extensions: ['apng'],
      },
      'image/avci': {
        source: 'iana',
      },
      'image/avcs': {
        source: 'iana',
      },
      'image/avif': {
        source: 'iana',
        compressible: false,
        extensions: ['avif'],
      },
      'image/bmp': {
        source: 'iana',
        compressible: true,
        extensions: ['bmp'],
      },
      'image/cgm': {
        source: 'iana',
        extensions: ['cgm'],
      },
      'image/dicom-rle': {
        source: 'iana',
        extensions: ['drle'],
      },
      'image/emf': {
        source: 'iana',
        extensions: ['emf'],
      },
      'image/fits': {
        source: 'iana',
        extensions: ['fits'],
      },
      'image/g3fax': {
        source: 'iana',
        extensions: ['g3'],
      },
      'image/gif': {
        source: 'iana',
        compressible: false,
        extensions: ['gif'],
      },
      'image/heic': {
        source: 'iana',
        extensions: ['heic'],
      },
      'image/heic-sequence': {
        source: 'iana',
        extensions: ['heics'],
      },
      'image/heif': {
        source: 'iana',
        extensions: ['heif'],
      },
      'image/heif-sequence': {
        source: 'iana',
        extensions: ['heifs'],
      },
      'image/hej2k': {
        source: 'iana',
        extensions: ['hej2'],
      },
      'image/hsj2': {
        source: 'iana',
        extensions: ['hsj2'],
      },
      'image/ief': {
        source: 'iana',
        extensions: ['ief'],
      },
      'image/jls': {
        source: 'iana',
        extensions: ['jls'],
      },
      'image/jp2': {
        source: 'iana',
        compressible: false,
        extensions: ['jp2', 'jpg2'],
      },
      'image/jpeg': {
        source: 'iana',
        compressible: false,
        extensions: ['jpeg', 'jpg', 'jpe'],
      },
      'image/jph': {
        source: 'iana',
        extensions: ['jph'],
      },
      'image/jphc': {
        source: 'iana',
        extensions: ['jhc'],
      },
      'image/jpm': {
        source: 'iana',
        compressible: false,
        extensions: ['jpm'],
      },
      'image/jpx': {
        source: 'iana',
        compressible: false,
        extensions: ['jpx', 'jpf'],
      },
      'image/jxr': {
        source: 'iana',
        extensions: ['jxr'],
      },
      'image/jxra': {
        source: 'iana',
        extensions: ['jxra'],
      },
      'image/jxrs': {
        source: 'iana',
        extensions: ['jxrs'],
      },
      'image/jxs': {
        source: 'iana',
        extensions: ['jxs'],
      },
      'image/jxsc': {
        source: 'iana',
        extensions: ['jxsc'],
      },
      'image/jxsi': {
        source: 'iana',
        extensions: ['jxsi'],
      },
      'image/jxss': {
        source: 'iana',
        extensions: ['jxss'],
      },
      'image/ktx': {
        source: 'iana',
        extensions: ['ktx'],
      },
      'image/ktx2': {
        source: 'iana',
        extensions: ['ktx2'],
      },
      'image/naplps': {
        source: 'iana',
      },
      'image/pjpeg': {
        compressible: false,
      },
      'image/png': {
        source: 'iana',
        compressible: false,
        extensions: ['png'],
      },
      'image/prs.btif': {
        source: 'iana',
        extensions: ['btif'],
      },
      'image/prs.pti': {
        source: 'iana',
        extensions: ['pti'],
      },
      'image/pwg-raster': {
        source: 'iana',
      },
      'image/sgi': {
        source: 'apache',
        extensions: ['sgi'],
      },
      'image/svg+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['svg', 'svgz'],
      },
      'image/t38': {
        source: 'iana',
        extensions: ['t38'],
      },
      'image/tiff': {
        source: 'iana',
        compressible: false,
        extensions: ['tif', 'tiff'],
      },
      'image/tiff-fx': {
        source: 'iana',
        extensions: ['tfx'],
      },
      'image/vnd.adobe.photoshop': {
        source: 'iana',
        compressible: true,
        extensions: ['psd'],
      },
      'image/vnd.airzip.accelerator.azv': {
        source: 'iana',
        extensions: ['azv'],
      },
      'image/vnd.cns.inf2': {
        source: 'iana',
      },
      'image/vnd.dece.graphic': {
        source: 'iana',
        extensions: ['uvi', 'uvvi', 'uvg', 'uvvg'],
      },
      'image/vnd.djvu': {
        source: 'iana',
        extensions: ['djvu', 'djv'],
      },
      'image/vnd.dvb.subtitle': {
        source: 'iana',
        extensions: ['sub'],
      },
      'image/vnd.dwg': {
        source: 'iana',
        extensions: ['dwg'],
      },
      'image/vnd.dxf': {
        source: 'iana',
        extensions: ['dxf'],
      },
      'image/vnd.fastbidsheet': {
        source: 'iana',
        extensions: ['fbs'],
      },
      'image/vnd.fpx': {
        source: 'iana',
        extensions: ['fpx'],
      },
      'image/vnd.fst': {
        source: 'iana',
        extensions: ['fst'],
      },
      'image/vnd.fujixerox.edmics-mmr': {
        source: 'iana',
        extensions: ['mmr'],
      },
      'image/vnd.fujixerox.edmics-rlc': {
        source: 'iana',
        extensions: ['rlc'],
      },
      'image/vnd.globalgraphics.pgb': {
        source: 'iana',
      },
      'image/vnd.microsoft.icon': {
        source: 'iana',
        extensions: ['ico'],
      },
      'image/vnd.mix': {
        source: 'iana',
      },
      'image/vnd.mozilla.apng': {
        source: 'iana',
      },
      'image/vnd.ms-dds': {
        extensions: ['dds'],
      },
      'image/vnd.ms-modi': {
        source: 'iana',
        extensions: ['mdi'],
      },
      'image/vnd.ms-photo': {
        source: 'apache',
        extensions: ['wdp'],
      },
      'image/vnd.net-fpx': {
        source: 'iana',
        extensions: ['npx'],
      },
      'image/vnd.pco.b16': {
        source: 'iana',
        extensions: ['b16'],
      },
      'image/vnd.radiance': {
        source: 'iana',
      },
      'image/vnd.sealed.png': {
        source: 'iana',
      },
      'image/vnd.sealedmedia.softseal.gif': {
        source: 'iana',
      },
      'image/vnd.sealedmedia.softseal.jpg': {
        source: 'iana',
      },
      'image/vnd.svf': {
        source: 'iana',
      },
      'image/vnd.tencent.tap': {
        source: 'iana',
        extensions: ['tap'],
      },
      'image/vnd.valve.source.texture': {
        source: 'iana',
        extensions: ['vtf'],
      },
      'image/vnd.wap.wbmp': {
        source: 'iana',
        extensions: ['wbmp'],
      },
      'image/vnd.xiff': {
        source: 'iana',
        extensions: ['xif'],
      },
      'image/vnd.zbrush.pcx': {
        source: 'iana',
        extensions: ['pcx'],
      },
      'image/webp': {
        source: 'apache',
        extensions: ['webp'],
      },
      'image/wmf': {
        source: 'iana',
        extensions: ['wmf'],
      },
      'image/x-3ds': {
        source: 'apache',
        extensions: ['3ds'],
      },
      'image/x-cmu-raster': {
        source: 'apache',
        extensions: ['ras'],
      },
      'image/x-cmx': {
        source: 'apache',
        extensions: ['cmx'],
      },
      'image/x-freehand': {
        source: 'apache',
        extensions: ['fh', 'fhc', 'fh4', 'fh5', 'fh7'],
      },
      'image/x-icon': {
        source: 'apache',
        compressible: true,
        extensions: ['ico'],
      },
      'image/x-jng': {
        source: 'nginx',
        extensions: ['jng'],
      },
      'image/x-mrsid-image': {
        source: 'apache',
        extensions: ['sid'],
      },
      'image/x-ms-bmp': {
        source: 'nginx',
        compressible: true,
        extensions: ['bmp'],
      },
      'image/x-pcx': {
        source: 'apache',
        extensions: ['pcx'],
      },
      'image/x-pict': {
        source: 'apache',
        extensions: ['pic', 'pct'],
      },
      'image/x-portable-anymap': {
        source: 'apache',
        extensions: ['pnm'],
      },
      'image/x-portable-bitmap': {
        source: 'apache',
        extensions: ['pbm'],
      },
      'image/x-portable-graymap': {
        source: 'apache',
        extensions: ['pgm'],
      },
      'image/x-portable-pixmap': {
        source: 'apache',
        extensions: ['ppm'],
      },
      'image/x-rgb': {
        source: 'apache',
        extensions: ['rgb'],
      },
      'image/x-tga': {
        source: 'apache',
        extensions: ['tga'],
      },
      'image/x-xbitmap': {
        source: 'apache',
        extensions: ['xbm'],
      },
      'image/x-xcf': {
        compressible: false,
      },
      'image/x-xpixmap': {
        source: 'apache',
        extensions: ['xpm'],
      },
      'image/x-xwindowdump': {
        source: 'apache',
        extensions: ['xwd'],
      },
      'message/cpim': {
        source: 'iana',
      },
      'message/delivery-status': {
        source: 'iana',
      },
      'message/disposition-notification': {
        source: 'iana',
        extensions: ['disposition-notification'],
      },
      'message/external-body': {
        source: 'iana',
      },
      'message/feedback-report': {
        source: 'iana',
      },
      'message/global': {
        source: 'iana',
        extensions: ['u8msg'],
      },
      'message/global-delivery-status': {
        source: 'iana',
        extensions: ['u8dsn'],
      },
      'message/global-disposition-notification': {
        source: 'iana',
        extensions: ['u8mdn'],
      },
      'message/global-headers': {
        source: 'iana',
        extensions: ['u8hdr'],
      },
      'message/http': {
        source: 'iana',
        compressible: false,
      },
      'message/imdn+xml': {
        source: 'iana',
        compressible: true,
      },
      'message/news': {
        source: 'iana',
      },
      'message/partial': {
        source: 'iana',
        compressible: false,
      },
      'message/rfc822': {
        source: 'iana',
        compressible: true,
        extensions: ['eml', 'mime'],
      },
      'message/s-http': {
        source: 'iana',
      },
      'message/sip': {
        source: 'iana',
      },
      'message/sipfrag': {
        source: 'iana',
      },
      'message/tracking-status': {
        source: 'iana',
      },
      'message/vnd.si.simp': {
        source: 'iana',
      },
      'message/vnd.wfa.wsc': {
        source: 'iana',
        extensions: ['wsc'],
      },
      'model/3mf': {
        source: 'iana',
        extensions: ['3mf'],
      },
      'model/e57': {
        source: 'iana',
      },
      'model/gltf+json': {
        source: 'iana',
        compressible: true,
        extensions: ['gltf'],
      },
      'model/gltf-binary': {
        source: 'iana',
        compressible: true,
        extensions: ['glb'],
      },
      'model/iges': {
        source: 'iana',
        compressible: false,
        extensions: ['igs', 'iges'],
      },
      'model/mesh': {
        source: 'iana',
        compressible: false,
        extensions: ['msh', 'mesh', 'silo'],
      },
      'model/mtl': {
        source: 'iana',
        extensions: ['mtl'],
      },
      'model/obj': {
        source: 'iana',
        extensions: ['obj'],
      },
      'model/stl': {
        source: 'iana',
        extensions: ['stl'],
      },
      'model/vnd.collada+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['dae'],
      },
      'model/vnd.dwf': {
        source: 'iana',
        extensions: ['dwf'],
      },
      'model/vnd.flatland.3dml': {
        source: 'iana',
      },
      'model/vnd.gdl': {
        source: 'iana',
        extensions: ['gdl'],
      },
      'model/vnd.gs-gdl': {
        source: 'apache',
      },
      'model/vnd.gs.gdl': {
        source: 'iana',
      },
      'model/vnd.gtw': {
        source: 'iana',
        extensions: ['gtw'],
      },
      'model/vnd.moml+xml': {
        source: 'iana',
        compressible: true,
      },
      'model/vnd.mts': {
        source: 'iana',
        extensions: ['mts'],
      },
      'model/vnd.opengex': {
        source: 'iana',
        extensions: ['ogex'],
      },
      'model/vnd.parasolid.transmit.binary': {
        source: 'iana',
        extensions: ['x_b'],
      },
      'model/vnd.parasolid.transmit.text': {
        source: 'iana',
        extensions: ['x_t'],
      },
      'model/vnd.rosette.annotated-data-model': {
        source: 'iana',
      },
      'model/vnd.sap.vds': {
        source: 'iana',
        extensions: ['vds'],
      },
      'model/vnd.usdz+zip': {
        source: 'iana',
        compressible: false,
        extensions: ['usdz'],
      },
      'model/vnd.valve.source.compiled-map': {
        source: 'iana',
        extensions: ['bsp'],
      },
      'model/vnd.vtu': {
        source: 'iana',
        extensions: ['vtu'],
      },
      'model/vrml': {
        source: 'iana',
        compressible: false,
        extensions: ['wrl', 'vrml'],
      },
      'model/x3d+binary': {
        source: 'apache',
        compressible: false,
        extensions: ['x3db', 'x3dbz'],
      },
      'model/x3d+fastinfoset': {
        source: 'iana',
        extensions: ['x3db'],
      },
      'model/x3d+vrml': {
        source: 'apache',
        compressible: false,
        extensions: ['x3dv', 'x3dvz'],
      },
      'model/x3d+xml': {
        source: 'iana',
        compressible: true,
        extensions: ['x3d', 'x3dz'],
      },
      'model/x3d-vrml': {
        source: 'iana',
        extensions: ['x3dv'],
      },
      'multipart/alternative': {
        source: 'iana',
        compressible: false,
      },
      'multipart/appledouble': {
        source: 'iana',
      },
      'multipart/byteranges': {
        source: 'iana',
      },
      'multipart/digest': {
        source: 'iana',
      },
      'multipart/encrypted': {
        source: 'iana',
        compressible: false,
      },
      'multipart/form-data': {
        source: 'iana',
        compressible: false,
      },
      'multipart/header-set': {
        source: 'iana',
      },
      'multipart/mixed': {
        source: 'iana',
      },
      'multipart/multilingual': {
        source: 'iana',
      },
      'multipart/parallel': {
        source: 'iana',
      },
      'multipart/related': {
        source: 'iana',
        compressible: false,
      },
      'multipart/report': {
        source: 'iana',
      },
      'multipart/signed': {
        source: 'iana',
        compressible: false,
      },
      'multipart/vnd.bint.med-plus': {
        source: 'iana',
      },
      'multipart/voice-message': {
        source: 'iana',
      },
      'multipart/x-mixed-replace': {
        source: 'iana',
      },
      'text/1d-interleaved-parityfec': {
        source: 'iana',
      },
      'text/cache-manifest': {
        source: 'iana',
        compressible: true,
        extensions: ['appcache', 'manifest'],
      },
      'text/calendar': {
        source: 'iana',
        extensions: ['ics', 'ifb'],
      },
      'text/calender': {
        compressible: true,
      },
      'text/cmd': {
        compressible: true,
      },
      'text/coffeescript': {
        extensions: ['coffee', 'litcoffee'],
      },
      'text/cql': {
        source: 'iana',
      },
      'text/cql-expression': {
        source: 'iana',
      },
      'text/cql-identifier': {
        source: 'iana',
      },
      'text/css': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
        extensions: ['css'],
      },
      'text/csv': {
        source: 'iana',
        compressible: true,
        extensions: ['csv'],
      },
      'text/csv-schema': {
        source: 'iana',
      },
      'text/directory': {
        source: 'iana',
      },
      'text/dns': {
        source: 'iana',
      },
      'text/ecmascript': {
        source: 'iana',
      },
      'text/encaprtp': {
        source: 'iana',
      },
      'text/enriched': {
        source: 'iana',
      },
      'text/fhirpath': {
        source: 'iana',
      },
      'text/flexfec': {
        source: 'iana',
      },
      'text/fwdred': {
        source: 'iana',
      },
      'text/gff3': {
        source: 'iana',
      },
      'text/grammar-ref-list': {
        source: 'iana',
      },
      'text/html': {
        source: 'iana',
        compressible: true,
        extensions: ['html', 'htm', 'shtml'],
      },
      'text/jade': {
        extensions: ['jade'],
      },
      'text/javascript': {
        source: 'iana',
        compressible: true,
      },
      'text/jcr-cnd': {
        source: 'iana',
      },
      'text/jsx': {
        compressible: true,
        extensions: ['jsx'],
      },
      'text/less': {
        compressible: true,
        extensions: ['less'],
      },
      'text/markdown': {
        source: 'iana',
        compressible: true,
        extensions: ['markdown', 'md'],
      },
      'text/mathml': {
        source: 'nginx',
        extensions: ['mml'],
      },
      'text/mdx': {
        compressible: true,
        extensions: ['mdx'],
      },
      'text/mizar': {
        source: 'iana',
      },
      'text/n3': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
        extensions: ['n3'],
      },
      'text/parameters': {
        source: 'iana',
        charset: 'UTF-8',
      },
      'text/parityfec': {
        source: 'iana',
      },
      'text/plain': {
        source: 'iana',
        compressible: true,
        extensions: ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini'],
      },
      'text/provenance-notation': {
        source: 'iana',
        charset: 'UTF-8',
      },
      'text/prs.fallenstein.rst': {
        source: 'iana',
      },
      'text/prs.lines.tag': {
        source: 'iana',
        extensions: ['dsc'],
      },
      'text/prs.prop.logic': {
        source: 'iana',
      },
      'text/raptorfec': {
        source: 'iana',
      },
      'text/red': {
        source: 'iana',
      },
      'text/rfc822-headers': {
        source: 'iana',
      },
      'text/richtext': {
        source: 'iana',
        compressible: true,
        extensions: ['rtx'],
      },
      'text/rtf': {
        source: 'iana',
        compressible: true,
        extensions: ['rtf'],
      },
      'text/rtp-enc-aescm128': {
        source: 'iana',
      },
      'text/rtploopback': {
        source: 'iana',
      },
      'text/rtx': {
        source: 'iana',
      },
      'text/sgml': {
        source: 'iana',
        extensions: ['sgml', 'sgm'],
      },
      'text/shaclc': {
        source: 'iana',
      },
      'text/shex': {
        extensions: ['shex'],
      },
      'text/slim': {
        extensions: ['slim', 'slm'],
      },
      'text/spdx': {
        source: 'iana',
        extensions: ['spdx'],
      },
      'text/strings': {
        source: 'iana',
      },
      'text/stylus': {
        extensions: ['stylus', 'styl'],
      },
      'text/t140': {
        source: 'iana',
      },
      'text/tab-separated-values': {
        source: 'iana',
        compressible: true,
        extensions: ['tsv'],
      },
      'text/troff': {
        source: 'iana',
        extensions: ['t', 'tr', 'roff', 'man', 'me', 'ms'],
      },
      'text/turtle': {
        source: 'iana',
        charset: 'UTF-8',
        extensions: ['ttl'],
      },
      'text/ulpfec': {
        source: 'iana',
      },
      'text/uri-list': {
        source: 'iana',
        compressible: true,
        extensions: ['uri', 'uris', 'urls'],
      },
      'text/vcard': {
        source: 'iana',
        compressible: true,
        extensions: ['vcard'],
      },
      'text/vnd.a': {
        source: 'iana',
      },
      'text/vnd.abc': {
        source: 'iana',
      },
      'text/vnd.ascii-art': {
        source: 'iana',
      },
      'text/vnd.curl': {
        source: 'iana',
        extensions: ['curl'],
      },
      'text/vnd.curl.dcurl': {
        source: 'apache',
        extensions: ['dcurl'],
      },
      'text/vnd.curl.mcurl': {
        source: 'apache',
        extensions: ['mcurl'],
      },
      'text/vnd.curl.scurl': {
        source: 'apache',
        extensions: ['scurl'],
      },
      'text/vnd.debian.copyright': {
        source: 'iana',
        charset: 'UTF-8',
      },
      'text/vnd.dmclientscript': {
        source: 'iana',
      },
      'text/vnd.dvb.subtitle': {
        source: 'iana',
        extensions: ['sub'],
      },
      'text/vnd.esmertec.theme-descriptor': {
        source: 'iana',
        charset: 'UTF-8',
      },
      'text/vnd.ficlab.flt': {
        source: 'iana',
      },
      'text/vnd.fly': {
        source: 'iana',
        extensions: ['fly'],
      },
      'text/vnd.fmi.flexstor': {
        source: 'iana',
        extensions: ['flx'],
      },
      'text/vnd.gml': {
        source: 'iana',
      },
      'text/vnd.graphviz': {
        source: 'iana',
        extensions: ['gv'],
      },
      'text/vnd.hans': {
        source: 'iana',
      },
      'text/vnd.hgl': {
        source: 'iana',
      },
      'text/vnd.in3d.3dml': {
        source: 'iana',
        extensions: ['3dml'],
      },
      'text/vnd.in3d.spot': {
        source: 'iana',
        extensions: ['spot'],
      },
      'text/vnd.iptc.newsml': {
        source: 'iana',
      },
      'text/vnd.iptc.nitf': {
        source: 'iana',
      },
      'text/vnd.latex-z': {
        source: 'iana',
      },
      'text/vnd.motorola.reflex': {
        source: 'iana',
      },
      'text/vnd.ms-mediapackage': {
        source: 'iana',
      },
      'text/vnd.net2phone.commcenter.command': {
        source: 'iana',
      },
      'text/vnd.radisys.msml-basic-layout': {
        source: 'iana',
      },
      'text/vnd.senx.warpscript': {
        source: 'iana',
      },
      'text/vnd.si.uricatalogue': {
        source: 'iana',
      },
      'text/vnd.sosi': {
        source: 'iana',
      },
      'text/vnd.sun.j2me.app-descriptor': {
        source: 'iana',
        charset: 'UTF-8',
        extensions: ['jad'],
      },
      'text/vnd.trolltech.linguist': {
        source: 'iana',
        charset: 'UTF-8',
      },
      'text/vnd.wap.si': {
        source: 'iana',
      },
      'text/vnd.wap.sl': {
        source: 'iana',
      },
      'text/vnd.wap.wml': {
        source: 'iana',
        extensions: ['wml'],
      },
      'text/vnd.wap.wmlscript': {
        source: 'iana',
        extensions: ['wmls'],
      },
      'text/vtt': {
        source: 'iana',
        charset: 'UTF-8',
        compressible: true,
        extensions: ['vtt'],
      },
      'text/x-asm': {
        source: 'apache',
        extensions: ['s', 'asm'],
      },
      'text/x-c': {
        source: 'apache',
        extensions: ['c', 'cc', 'cxx', 'cpp', 'h', 'hh', 'dic'],
      },
      'text/x-component': {
        source: 'nginx',
        extensions: ['htc'],
      },
      'text/x-fortran': {
        source: 'apache',
        extensions: ['f', 'for', 'f77', 'f90'],
      },
      'text/x-gwt-rpc': {
        compressible: true,
      },
      'text/x-handlebars-template': {
        extensions: ['hbs'],
      },
      'text/x-java-source': {
        source: 'apache',
        extensions: ['java'],
      },
      'text/x-jquery-tmpl': {
        compressible: true,
      },
      'text/x-lua': {
        extensions: ['lua'],
      },
      'text/x-markdown': {
        compressible: true,
        extensions: ['mkd'],
      },
      'text/x-nfo': {
        source: 'apache',
        extensions: ['nfo'],
      },
      'text/x-opml': {
        source: 'apache',
        extensions: ['opml'],
      },
      'text/x-org': {
        compressible: true,
        extensions: ['org'],
      },
      'text/x-pascal': {
        source: 'apache',
        extensions: ['p', 'pas'],
      },
      'text/x-processing': {
        compressible: true,
        extensions: ['pde'],
      },
      'text/x-sass': {
        extensions: ['sass'],
      },
      'text/x-scss': {
        extensions: ['scss'],
      },
      'text/x-setext': {
        source: 'apache',
        extensions: ['etx'],
      },
      'text/x-sfv': {
        source: 'apache',
        extensions: ['sfv'],
      },
      'text/x-suse-ymp': {
        compressible: true,
        extensions: ['ymp'],
      },
      'text/x-uuencode': {
        source: 'apache',
        extensions: ['uu'],
      },
      'text/x-vcalendar': {
        source: 'apache',
        extensions: ['vcs'],
      },
      'text/x-vcard': {
        source: 'apache',
        extensions: ['vcf'],
      },
      'text/xml': {
        source: 'iana',
        compressible: true,
        extensions: ['xml'],
      },
      'text/xml-external-parsed-entity': {
        source: 'iana',
      },
      'text/yaml': {
        extensions: ['yaml', 'yml'],
      },
      'video/1d-interleaved-parityfec': {
        source: 'iana',
      },
      'video/3gpp': {
        source: 'iana',
        extensions: ['3gp', '3gpp'],
      },
      'video/3gpp-tt': {
        source: 'iana',
      },
      'video/3gpp2': {
        source: 'iana',
        extensions: ['3g2'],
      },
      'video/av1': {
        source: 'iana',
      },
      'video/bmpeg': {
        source: 'iana',
      },
      'video/bt656': {
        source: 'iana',
      },
      'video/celb': {
        source: 'iana',
      },
      'video/dv': {
        source: 'iana',
      },
      'video/encaprtp': {
        source: 'iana',
      },
      'video/ffv1': {
        source: 'iana',
      },
      'video/flexfec': {
        source: 'iana',
      },
      'video/h261': {
        source: 'iana',
        extensions: ['h261'],
      },
      'video/h263': {
        source: 'iana',
        extensions: ['h263'],
      },
      'video/h263-1998': {
        source: 'iana',
      },
      'video/h263-2000': {
        source: 'iana',
      },
      'video/h264': {
        source: 'iana',
        extensions: ['h264'],
      },
      'video/h264-rcdo': {
        source: 'iana',
      },
      'video/h264-svc': {
        source: 'iana',
      },
      'video/h265': {
        source: 'iana',
      },
      'video/iso.segment': {
        source: 'iana',
        extensions: ['m4s'],
      },
      'video/jpeg': {
        source: 'iana',
        extensions: ['jpgv'],
      },
      'video/jpeg2000': {
        source: 'iana',
      },
      'video/jpm': {
        source: 'apache',
        extensions: ['jpm', 'jpgm'],
      },
      'video/mj2': {
        source: 'iana',
        extensions: ['mj2', 'mjp2'],
      },
      'video/mp1s': {
        source: 'iana',
      },
      'video/mp2p': {
        source: 'iana',
      },
      'video/mp2t': {
        source: 'iana',
        extensions: ['ts'],
      },
      'video/mp4': {
        source: 'iana',
        compressible: false,
        extensions: ['mp4', 'mp4v', 'mpg4'],
      },
      'video/mp4v-es': {
        source: 'iana',
      },
      'video/mpeg': {
        source: 'iana',
        compressible: false,
        extensions: ['mpeg', 'mpg', 'mpe', 'm1v', 'm2v'],
      },
      'video/mpeg4-generic': {
        source: 'iana',
      },
      'video/mpv': {
        source: 'iana',
      },
      'video/nv': {
        source: 'iana',
      },
      'video/ogg': {
        source: 'iana',
        compressible: false,
        extensions: ['ogv'],
      },
      'video/parityfec': {
        source: 'iana',
      },
      'video/pointer': {
        source: 'iana',
      },
      'video/quicktime': {
        source: 'iana',
        compressible: false,
        extensions: ['qt', 'mov'],
      },
      'video/raptorfec': {
        source: 'iana',
      },
      'video/raw': {
        source: 'iana',
      },
      'video/rtp-enc-aescm128': {
        source: 'iana',
      },
      'video/rtploopback': {
        source: 'iana',
      },
      'video/rtx': {
        source: 'iana',
      },
      'video/scip': {
        source: 'iana',
      },
      'video/smpte291': {
        source: 'iana',
      },
      'video/smpte292m': {
        source: 'iana',
      },
      'video/ulpfec': {
        source: 'iana',
      },
      'video/vc1': {
        source: 'iana',
      },
      'video/vc2': {
        source: 'iana',
      },
      'video/vnd.cctv': {
        source: 'iana',
      },
      'video/vnd.dece.hd': {
        source: 'iana',
        extensions: ['uvh', 'uvvh'],
      },
      'video/vnd.dece.mobile': {
        source: 'iana',
        extensions: ['uvm', 'uvvm'],
      },
      'video/vnd.dece.mp4': {
        source: 'iana',
      },
      'video/vnd.dece.pd': {
        source: 'iana',
        extensions: ['uvp', 'uvvp'],
      },
      'video/vnd.dece.sd': {
        source: 'iana',
        extensions: ['uvs', 'uvvs'],
      },
      'video/vnd.dece.video': {
        source: 'iana',
        extensions: ['uvv', 'uvvv'],
      },
      'video/vnd.directv.mpeg': {
        source: 'iana',
      },
      'video/vnd.directv.mpeg-tts': {
        source: 'iana',
      },
      'video/vnd.dlna.mpeg-tts': {
        source: 'iana',
      },
      'video/vnd.dvb.file': {
        source: 'iana',
        extensions: ['dvb'],
      },
      'video/vnd.fvt': {
        source: 'iana',
        extensions: ['fvt'],
      },
      'video/vnd.hns.video': {
        source: 'iana',
      },
      'video/vnd.iptvforum.1dparityfec-1010': {
        source: 'iana',
      },
      'video/vnd.iptvforum.1dparityfec-2005': {
        source: 'iana',
      },
      'video/vnd.iptvforum.2dparityfec-1010': {
        source: 'iana',
      },
      'video/vnd.iptvforum.2dparityfec-2005': {
        source: 'iana',
      },
      'video/vnd.iptvforum.ttsavc': {
        source: 'iana',
      },
      'video/vnd.iptvforum.ttsmpeg2': {
        source: 'iana',
      },
      'video/vnd.motorola.video': {
        source: 'iana',
      },
      'video/vnd.motorola.videop': {
        source: 'iana',
      },
      'video/vnd.mpegurl': {
        source: 'iana',
        extensions: ['mxu', 'm4u'],
      },
      'video/vnd.ms-playready.media.pyv': {
        source: 'iana',
        extensions: ['pyv'],
      },
      'video/vnd.nokia.interleaved-multimedia': {
        source: 'iana',
      },
      'video/vnd.nokia.mp4vr': {
        source: 'iana',
      },
      'video/vnd.nokia.videovoip': {
        source: 'iana',
      },
      'video/vnd.objectvideo': {
        source: 'iana',
      },
      'video/vnd.radgamettools.bink': {
        source: 'iana',
      },
      'video/vnd.radgamettools.smacker': {
        source: 'iana',
      },
      'video/vnd.sealed.mpeg1': {
        source: 'iana',
      },
      'video/vnd.sealed.mpeg4': {
        source: 'iana',
      },
      'video/vnd.sealed.swf': {
        source: 'iana',
      },
      'video/vnd.sealedmedia.softseal.mov': {
        source: 'iana',
      },
      'video/vnd.uvvu.mp4': {
        source: 'iana',
        extensions: ['uvu', 'uvvu'],
      },
      'video/vnd.vivo': {
        source: 'iana',
        extensions: ['viv'],
      },
      'video/vnd.youtube.yt': {
        source: 'iana',
      },
      'video/vp8': {
        source: 'iana',
      },
      'video/webm': {
        source: 'apache',
        compressible: false,
        extensions: ['webm'],
      },
      'video/x-f4v': {
        source: 'apache',
        extensions: ['f4v'],
      },
      'video/x-fli': {
        source: 'apache',
        extensions: ['fli'],
      },
      'video/x-flv': {
        source: 'apache',
        compressible: false,
        extensions: ['flv'],
      },
      'video/x-m4v': {
        source: 'apache',
        extensions: ['m4v'],
      },
      'video/x-matroska': {
        source: 'apache',
        compressible: false,
        extensions: ['mkv', 'mk3d', 'mks'],
      },
      'video/x-mng': {
        source: 'apache',
        extensions: ['mng'],
      },
      'video/x-ms-asf': {
        source: 'apache',
        extensions: ['asf', 'asx'],
      },
      'video/x-ms-vob': {
        source: 'apache',
        extensions: ['vob'],
      },
      'video/x-ms-wm': {
        source: 'apache',
        extensions: ['wm'],
      },
      'video/x-ms-wmv': {
        source: 'apache',
        compressible: false,
        extensions: ['wmv'],
      },
      'video/x-ms-wmx': {
        source: 'apache',
        extensions: ['wmx'],
      },
      'video/x-ms-wvx': {
        source: 'apache',
        extensions: ['wvx'],
      },
      'video/x-msvideo': {
        source: 'apache',
        extensions: ['avi'],
      },
      'video/x-sgi-movie': {
        source: 'apache',
        extensions: ['movie'],
      },
      'video/x-smv': {
        source: 'apache',
        extensions: ['smv'],
      },
      'x-conference/x-cooltalk': {
        source: 'apache',
        extensions: ['ice'],
      },
      'x-shader/x-fragment': {
        compressible: true,
      },
      'x-shader/x-vertex': {
        compressible: true,
      },
    }
  },
})

// node_modules/mime-db/index.js
var require_mime_db = __commonJS({
  'node_modules/mime-db/index.js'(exports2, module2) {
    module2.exports = require_db()
  },
})

// node_modules/mime-types/index.js
var require_mime_types = __commonJS({
  'node_modules/mime-types/index.js'(exports2) {
    'use strict'
    var db = require_mime_db()
    var extname = require('path').extname
    var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/
    var TEXT_TYPE_REGEXP = /^text\//i
    exports2.charset = charset
    exports2.charsets = { lookup: charset }
    exports2.contentType = contentType
    exports2.extension = extension
    exports2.extensions = /* @__PURE__ */ Object.create(null)
    exports2.lookup = lookup
    exports2.types = /* @__PURE__ */ Object.create(null)
    populateMaps(exports2.extensions, exports2.types)
    function charset(type) {
      if (!type || typeof type !== 'string') {
        return false
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type)
      var mime = match && db[match[1].toLowerCase()]
      if (mime && mime.charset) {
        return mime.charset
      }
      if (match && TEXT_TYPE_REGEXP.test(match[1])) {
        return 'UTF-8'
      }
      return false
    }
    function contentType(str) {
      if (!str || typeof str !== 'string') {
        return false
      }
      var mime = str.indexOf('/') === -1 ? exports2.lookup(str) : str
      if (!mime) {
        return false
      }
      if (mime.indexOf('charset') === -1) {
        var charset2 = exports2.charset(mime)
        if (charset2) mime += '; charset=' + charset2.toLowerCase()
      }
      return mime
    }
    function extension(type) {
      if (!type || typeof type !== 'string') {
        return false
      }
      var match = EXTRACT_TYPE_REGEXP.exec(type)
      var exts = match && exports2.extensions[match[1].toLowerCase()]
      if (!exts || !exts.length) {
        return false
      }
      return exts[0]
    }
    function lookup(path) {
      if (!path || typeof path !== 'string') {
        return false
      }
      var extension2 = extname('x.' + path)
        .toLowerCase()
        .substr(1)
      if (!extension2) {
        return false
      }
      return exports2.types[extension2] || false
    }
    function populateMaps(extensions, types) {
      var preference = ['nginx', 'apache', void 0, 'iana']
      Object.keys(db).forEach(function forEachMimeType(type) {
        var mime = db[type]
        var exts = mime.extensions
        if (!exts || !exts.length) {
          return
        }
        extensions[type] = exts
        for (var i = 0; i < exts.length; i++) {
          var extension2 = exts[i]
          if (types[extension2]) {
            var from = preference.indexOf(db[types[extension2]].source)
            var to = preference.indexOf(mime.source)
            if (
              types[extension2] !== 'application/octet-stream' &&
              (from > to || (from === to && types[extension2].substr(0, 12) === 'application/'))
            ) {
              continue
            }
          }
          types[extension2] = type
        }
      })
    }
  },
})

// node_modules/asynckit/lib/defer.js
var require_defer = __commonJS({
  'node_modules/asynckit/lib/defer.js'(exports2, module2) {
    module2.exports = defer
    function defer(fn) {
      var nextTick =
        typeof setImmediate == 'function'
          ? setImmediate
          : typeof process == 'object' && typeof process.nextTick == 'function'
          ? process.nextTick
          : null
      if (nextTick) {
        nextTick(fn)
      } else {
        setTimeout(fn, 0)
      }
    }
  },
})

// node_modules/asynckit/lib/async.js
var require_async = __commonJS({
  'node_modules/asynckit/lib/async.js'(exports2, module2) {
    var defer = require_defer()
    module2.exports = async
    function async(callback) {
      var isAsync = false
      defer(function () {
        isAsync = true
      })
      return function async_callback(err, result) {
        if (isAsync) {
          callback(err, result)
        } else {
          defer(function nextTick_callback() {
            callback(err, result)
          })
        }
      }
    }
  },
})

// node_modules/asynckit/lib/abort.js
var require_abort = __commonJS({
  'node_modules/asynckit/lib/abort.js'(exports2, module2) {
    module2.exports = abort
    function abort(state) {
      Object.keys(state.jobs).forEach(clean.bind(state))
      state.jobs = {}
    }
    function clean(key) {
      if (typeof this.jobs[key] == 'function') {
        this.jobs[key]()
      }
    }
  },
})

// node_modules/asynckit/lib/iterate.js
var require_iterate = __commonJS({
  'node_modules/asynckit/lib/iterate.js'(exports2, module2) {
    var async = require_async()
    var abort = require_abort()
    module2.exports = iterate
    function iterate(list, iterator, state, callback) {
      var key = state['keyedList'] ? state['keyedList'][state.index] : state.index
      state.jobs[key] = runJob(iterator, key, list[key], function (error, output) {
        if (!(key in state.jobs)) {
          return
        }
        delete state.jobs[key]
        if (error) {
          abort(state)
        } else {
          state.results[key] = output
        }
        callback(error, state.results)
      })
    }
    function runJob(iterator, key, item, callback) {
      var aborter
      if (iterator.length == 2) {
        aborter = iterator(item, async(callback))
      } else {
        aborter = iterator(item, key, async(callback))
      }
      return aborter
    }
  },
})

// node_modules/asynckit/lib/state.js
var require_state = __commonJS({
  'node_modules/asynckit/lib/state.js'(exports2, module2) {
    module2.exports = state
    function state(list, sortMethod) {
      var isNamedList = !Array.isArray(list),
        initState = {
          index: 0,
          keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
          jobs: {},
          results: isNamedList ? {} : [],
          size: isNamedList ? Object.keys(list).length : list.length,
        }
      if (sortMethod) {
        initState.keyedList.sort(
          isNamedList
            ? sortMethod
            : function (a, b) {
                return sortMethod(list[a], list[b])
              },
        )
      }
      return initState
    }
  },
})

// node_modules/asynckit/lib/terminator.js
var require_terminator = __commonJS({
  'node_modules/asynckit/lib/terminator.js'(exports2, module2) {
    var abort = require_abort()
    var async = require_async()
    module2.exports = terminator
    function terminator(callback) {
      if (!Object.keys(this.jobs).length) {
        return
      }
      this.index = this.size
      abort(this)
      async(callback)(null, this.results)
    }
  },
})

// node_modules/asynckit/parallel.js
var require_parallel = __commonJS({
  'node_modules/asynckit/parallel.js'(exports2, module2) {
    var iterate = require_iterate()
    var initState = require_state()
    var terminator = require_terminator()
    module2.exports = parallel
    function parallel(list, iterator, callback) {
      var state = initState(list)
      while (state.index < (state['keyedList'] || list).length) {
        iterate(list, iterator, state, function (error, result) {
          if (error) {
            callback(error, result)
            return
          }
          if (Object.keys(state.jobs).length === 0) {
            callback(null, state.results)
            return
          }
        })
        state.index++
      }
      return terminator.bind(state, callback)
    }
  },
})

// node_modules/asynckit/serialOrdered.js
var require_serialOrdered = __commonJS({
  'node_modules/asynckit/serialOrdered.js'(exports2, module2) {
    var iterate = require_iterate()
    var initState = require_state()
    var terminator = require_terminator()
    module2.exports = serialOrdered
    module2.exports.ascending = ascending
    module2.exports.descending = descending
    function serialOrdered(list, iterator, sortMethod, callback) {
      var state = initState(list, sortMethod)
      iterate(list, iterator, state, function iteratorHandler(error, result) {
        if (error) {
          callback(error, result)
          return
        }
        state.index++
        if (state.index < (state['keyedList'] || list).length) {
          iterate(list, iterator, state, iteratorHandler)
          return
        }
        callback(null, state.results)
      })
      return terminator.bind(state, callback)
    }
    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : 0
    }
    function descending(a, b) {
      return -1 * ascending(a, b)
    }
  },
})

// node_modules/asynckit/serial.js
var require_serial = __commonJS({
  'node_modules/asynckit/serial.js'(exports2, module2) {
    var serialOrdered = require_serialOrdered()
    module2.exports = serial
    function serial(list, iterator, callback) {
      return serialOrdered(list, iterator, null, callback)
    }
  },
})

// node_modules/asynckit/index.js
var require_asynckit = __commonJS({
  'node_modules/asynckit/index.js'(exports2, module2) {
    module2.exports = {
      parallel: require_parallel(),
      serial: require_serial(),
      serialOrdered: require_serialOrdered(),
    }
  },
})

// node_modules/then-request/node_modules/form-data/lib/populate.js
var require_populate = __commonJS({
  'node_modules/then-request/node_modules/form-data/lib/populate.js'(exports2, module2) {
    module2.exports = function (dst, src) {
      Object.keys(src).forEach(function (prop) {
        dst[prop] = dst[prop] || src[prop]
      })
      return dst
    }
  },
})

// node_modules/then-request/node_modules/form-data/lib/form_data.js
var require_form_data = __commonJS({
  'node_modules/then-request/node_modules/form-data/lib/form_data.js'(exports2, module2) {
    var CombinedStream = require_combined_stream()
    var util = require('util')
    var path = require('path')
    var http = require('http')
    var https = require('https')
    var parseUrl = require('url').parse
    var fs = require('fs')
    var mime = require_mime_types()
    var asynckit = require_asynckit()
    var populate = require_populate()
    module2.exports = FormData
    util.inherits(FormData, CombinedStream)
    function FormData(options) {
      if (!(this instanceof FormData)) {
        return new FormData()
      }
      this._overheadLength = 0
      this._valueLength = 0
      this._valuesToMeasure = []
      CombinedStream.call(this)
      options = options || {}
      for (var option in options) {
        this[option] = options[option]
      }
    }
    FormData.LINE_BREAK = '\r\n'
    FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream'
    FormData.prototype.append = function (field, value, options) {
      options = options || {}
      if (typeof options == 'string') {
        options = { filename: options }
      }
      var append = CombinedStream.prototype.append.bind(this)
      if (typeof value == 'number') {
        value = '' + value
      }
      if (util.isArray(value)) {
        this._error(new Error('Arrays are not supported.'))
        return
      }
      var header = this._multiPartHeader(field, value, options)
      var footer = this._multiPartFooter()
      append(header)
      append(value)
      append(footer)
      this._trackLength(header, value, options)
    }
    FormData.prototype._trackLength = function (header, value, options) {
      var valueLength = 0
      if (options.knownLength != null) {
        valueLength += +options.knownLength
      } else if (Buffer.isBuffer(value)) {
        valueLength = value.length
      } else if (typeof value === 'string') {
        valueLength = Buffer.byteLength(value)
      }
      this._valueLength += valueLength
      this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length
      if (!value || (!value.path && !(value.readable && value.hasOwnProperty('httpVersion')))) {
        return
      }
      if (!options.knownLength) {
        this._valuesToMeasure.push(value)
      }
    }
    FormData.prototype._lengthRetriever = function (value, callback) {
      if (value.hasOwnProperty('fd')) {
        if (value.end != void 0 && value.end != Infinity && value.start != void 0) {
          callback(null, value.end + 1 - (value.start ? value.start : 0))
        } else {
          fs.stat(value.path, function (err, stat) {
            var fileSize
            if (err) {
              callback(err)
              return
            }
            fileSize = stat.size - (value.start ? value.start : 0)
            callback(null, fileSize)
          })
        }
      } else if (value.hasOwnProperty('httpVersion')) {
        callback(null, +value.headers['content-length'])
      } else if (value.hasOwnProperty('httpModule')) {
        value.on('response', function (response) {
          value.pause()
          callback(null, +response.headers['content-length'])
        })
        value.resume()
      } else {
        callback('Unknown stream')
      }
    }
    FormData.prototype._multiPartHeader = function (field, value, options) {
      if (typeof options.header == 'string') {
        return options.header
      }
      var contentDisposition = this._getContentDisposition(value, options)
      var contentType = this._getContentType(value, options)
      var contents = ''
      var headers = {
        'Content-Disposition': ['form-data', 'name="' + field + '"'].concat(contentDisposition || []),
        'Content-Type': [].concat(contentType || []),
      }
      if (typeof options.header == 'object') {
        populate(headers, options.header)
      }
      var header
      for (var prop in headers) {
        if (!headers.hasOwnProperty(prop)) continue
        header = headers[prop]
        if (header == null) {
          continue
        }
        if (!Array.isArray(header)) {
          header = [header]
        }
        if (header.length) {
          contents += prop + ': ' + header.join('; ') + FormData.LINE_BREAK
        }
      }
      return '--' + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK
    }
    FormData.prototype._getContentDisposition = function (value, options) {
      var filename, contentDisposition
      if (typeof options.filepath === 'string') {
        filename = path.normalize(options.filepath).replace(/\\/g, '/')
      } else if (options.filename || value.name || value.path) {
        filename = path.basename(options.filename || value.name || value.path)
      } else if (value.readable && value.hasOwnProperty('httpVersion')) {
        filename = path.basename(value.client._httpMessage.path || '')
      }
      if (filename) {
        contentDisposition = 'filename="' + filename + '"'
      }
      return contentDisposition
    }
    FormData.prototype._getContentType = function (value, options) {
      var contentType = options.contentType
      if (!contentType && value.name) {
        contentType = mime.lookup(value.name)
      }
      if (!contentType && value.path) {
        contentType = mime.lookup(value.path)
      }
      if (!contentType && value.readable && value.hasOwnProperty('httpVersion')) {
        contentType = value.headers['content-type']
      }
      if (!contentType && (options.filepath || options.filename)) {
        contentType = mime.lookup(options.filepath || options.filename)
      }
      if (!contentType && typeof value == 'object') {
        contentType = FormData.DEFAULT_CONTENT_TYPE
      }
      return contentType
    }
    FormData.prototype._multiPartFooter = function () {
      return function (next) {
        var footer = FormData.LINE_BREAK
        var lastPart = this._streams.length === 0
        if (lastPart) {
          footer += this._lastBoundary()
        }
        next(footer)
      }.bind(this)
    }
    FormData.prototype._lastBoundary = function () {
      return '--' + this.getBoundary() + '--' + FormData.LINE_BREAK
    }
    FormData.prototype.getHeaders = function (userHeaders) {
      var header
      var formHeaders = {
        'content-type': 'multipart/form-data; boundary=' + this.getBoundary(),
      }
      for (header in userHeaders) {
        if (userHeaders.hasOwnProperty(header)) {
          formHeaders[header.toLowerCase()] = userHeaders[header]
        }
      }
      return formHeaders
    }
    FormData.prototype.getBoundary = function () {
      if (!this._boundary) {
        this._generateBoundary()
      }
      return this._boundary
    }
    FormData.prototype.getBuffer = function () {
      var dataBuffer = new Buffer.alloc(0)
      var boundary = this.getBoundary()
      for (var i = 0, len = this._streams.length; i < len; i++) {
        if (typeof this._streams[i] !== 'function') {
          if (Buffer.isBuffer(this._streams[i])) {
            dataBuffer = Buffer.concat([dataBuffer, this._streams[i]])
          } else {
            dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i])])
          }
          if (typeof this._streams[i] !== 'string' || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
            dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData.LINE_BREAK)])
          }
        }
      }
      return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())])
    }
    FormData.prototype._generateBoundary = function () {
      var boundary = '--------------------------'
      for (var i = 0; i < 24; i++) {
        boundary += Math.floor(Math.random() * 10).toString(16)
      }
      this._boundary = boundary
    }
    FormData.prototype.getLengthSync = function () {
      var knownLength = this._overheadLength + this._valueLength
      if (this._streams.length) {
        knownLength += this._lastBoundary().length
      }
      if (!this.hasKnownLength()) {
        this._error(new Error('Cannot calculate proper length in synchronous way.'))
      }
      return knownLength
    }
    FormData.prototype.hasKnownLength = function () {
      var hasKnownLength = true
      if (this._valuesToMeasure.length) {
        hasKnownLength = false
      }
      return hasKnownLength
    }
    FormData.prototype.getLength = function (cb) {
      var knownLength = this._overheadLength + this._valueLength
      if (this._streams.length) {
        knownLength += this._lastBoundary().length
      }
      if (!this._valuesToMeasure.length) {
        process.nextTick(cb.bind(this, null, knownLength))
        return
      }
      asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function (err, values) {
        if (err) {
          cb(err)
          return
        }
        values.forEach(function (length) {
          knownLength += length
        })
        cb(null, knownLength)
      })
    }
    FormData.prototype.submit = function (params, cb) {
      var request,
        options,
        defaults = { method: 'post' }
      if (typeof params == 'string') {
        params = parseUrl(params)
        options = populate(
          {
            port: params.port,
            path: params.pathname,
            host: params.hostname,
            protocol: params.protocol,
          },
          defaults,
        )
      } else {
        options = populate(params, defaults)
        if (!options.port) {
          options.port = options.protocol == 'https:' ? 443 : 80
        }
      }
      options.headers = this.getHeaders(params.headers)
      if (options.protocol == 'https:') {
        request = https.request(options)
      } else {
        request = http.request(options)
      }
      this.getLength(
        function (err, length) {
          if (err) {
            this._error(err)
            return
          }
          request.setHeader('Content-Length', length)
          this.pipe(request)
          if (cb) {
            request.on('error', cb)
            request.on('response', cb.bind(this, null))
          }
        }.bind(this),
      )
      return request
    }
    FormData.prototype._error = function (err) {
      if (!this.error) {
        this.error = err
        this.pause()
        this.emit('error', err)
      }
    }
    FormData.prototype.toString = function () {
      return '[object FormData]'
    }
  },
})

// node_modules/then-request/lib/index.js
var require_lib6 = __commonJS({
  'node_modules/then-request/lib/index.js'(exports2, module2) {
    'use strict'
    var __assign =
      (exports2 && exports2.__assign) ||
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i]
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
        }
        return t
      }
    exports2.__esModule = true
    var GenericResponse = require_lib2()
    var Promise2 = require_promise()
    var concat = require_concat_stream()
    var ResponsePromise_1 = require_ResponsePromise()
    exports2.ResponsePromise = ResponsePromise_1.ResponsePromise
    var handle_qs_1 = require_handle_qs()
    var http_basic_1 = require_lib5()
    var FormData = require_form_data()
    exports2.FormData = FormData
    var caseless = require_caseless()
    var basicRequest = http_basic_1['default']
    var BufferBody = (function () {
      function BufferBody2(body, extraHeaders) {
        this._body = body
        this._headers = extraHeaders
      }
      BufferBody2.prototype.getHeaders = function () {
        return Promise2.resolve(__assign({ 'content-length': '' + this._body.length }, this._headers))
      }
      BufferBody2.prototype.pipe = function (stream) {
        stream.end(this._body)
      }
      return BufferBody2
    })()
    var FormBody = (function () {
      function FormBody2(body) {
        this._body = body
      }
      FormBody2.prototype.getHeaders = function () {
        var _this = this
        var headers = this._body.getHeaders()
        return new Promise2(function (resolve, reject) {
          var gotLength = false
          _this._body.getLength(function (err, length) {
            if (gotLength) return
            gotLength = true
            if (err) {
              return reject(typeof err == 'string' ? new Error(err) : err)
            }
            headers['content-length'] = '' + length
            resolve(headers)
          })
        })
      }
      FormBody2.prototype.pipe = function (stream) {
        this._body.pipe(stream)
      }
      return FormBody2
    })()
    var StreamBody = (function () {
      function StreamBody2(body) {
        this._body = body
      }
      StreamBody2.prototype.getHeaders = function () {
        return Promise2.resolve({})
      }
      StreamBody2.prototype.pipe = function (stream) {
        this._body.pipe(stream)
      }
      return StreamBody2
    })()
    function handleBody(options) {
      if (options.form) {
        return new FormBody(options.form)
      }
      var extraHeaders = {}
      var body = options.body
      if (options.json) {
        extraHeaders['content-type'] = 'application/json'
        body = JSON.stringify(options.json)
      }
      if (typeof body === 'string') {
        body = Buffer.from(body)
      }
      if (!body) {
        body = Buffer.alloc(0)
      }
      if (!Buffer.isBuffer(body)) {
        if (typeof body.pipe === 'function') {
          return new StreamBody(body)
        }
        throw new TypeError('body should be a Buffer or a String')
      }
      return new BufferBody(body, extraHeaders)
    }
    function request(method, url, options) {
      if (options === void 0) {
        options = {}
      }
      return ResponsePromise_1['default'](
        new Promise2(function (resolve, reject) {
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
          options.headers = options.headers || {}
          var headers = caseless(options.headers)
          if (options.qs) {
            url = handle_qs_1['default'](url, options.qs)
          }
          var duplex = !(method === 'GET' || method === 'DELETE' || method === 'HEAD')
          if (duplex) {
            var body_1 = handleBody(options)
            body_1
              .getHeaders()
              .then(function (bodyHeaders) {
                Object.keys(bodyHeaders).forEach(function (key) {
                  if (!headers.has(key)) {
                    headers.set(key, bodyHeaders[key])
                  }
                })
                ready(body_1)
              })
              ['catch'](reject)
          } else if (options.body) {
            throw new Error('You cannot pass a body to a ' + method + ' request.')
          } else {
            ready()
          }
          function ready(body) {
            var req = basicRequest(
              method,
              url,
              {
                allowRedirectHeaders: options.allowRedirectHeaders,
                headers: options.headers,
                followRedirects: options.followRedirects !== false,
                maxRedirects: options.maxRedirects,
                gzip: options.gzip !== false,
                cache: options.cache,
                agent: options.agent,
                timeout: options.timeout,
                socketTimeout: options.socketTimeout,
                retry: options.retry,
                retryDelay: options.retryDelay,
                maxRetries: options.maxRetries,
                isMatch: options.isMatch,
                isExpired: options.isExpired,
                canCache: options.canCache,
              },
              function (err, res) {
                if (err) return reject(err)
                if (!res) return reject(new Error('No request was received'))
                res.body.on('error', reject)
                res.body.pipe(
                  concat(function (body2) {
                    resolve(
                      new GenericResponse(
                        res.statusCode,
                        res.headers,
                        Array.isArray(body2) ? Buffer.alloc(0) : body2,
                        res.url,
                      ),
                    )
                  }),
                )
              },
            )
            if (req && body) {
              body.pipe(req)
            }
          }
        }),
      )
    }
    exports2['default'] = request
    module2.exports = request
    module2.exports['default'] = request
    module2.exports.FormData = FormData
  },
})

// utils/files.js
var require_files = __commonJS({
  'utils/files.js'(exports2, module2) {
    var fs = require('fs')
    var request = require_lib6()
    var readFile = function (fileName) {
      return new Promise((resolve) => {
        fs.readFile(fileName, 'utf8', (err, data) => {
          process.nextTick(() => resolve(data))
        })
      })
    }
    var readHTTPSFile = function (url) {
      return request('GET', url).then((res) => res.getBody())
    }
    module2.exports = {
      readFile,
      readHTTPSFile,
    }
  },
})

// common/schema/loader.js
var require_loader = __commonJS({
  'common/schema/loader.js'(exports2, module2) {
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
          const filePath = require('../../data/' + localName + '.xml')
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
    module2.exports = {
      loadSchemaFromSpec,
      loadSchema,
    }
  },
})

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  'node_modules/semver/internal/debug.js'(exports2, module2) {
    var debug =
      typeof process === 'object' && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG)
        ? (...args) => console.error('SEMVER', ...args)
        : () => {}
    module2.exports = debug
  },
})

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  'node_modules/semver/internal/constants.js'(exports2, module2) {
    var SEMVER_SPEC_VERSION = '2.0.0'
    var MAX_LENGTH = 256
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991
    var MAX_SAFE_COMPONENT_LENGTH = 16
    module2.exports = {
      SEMVER_SPEC_VERSION,
      MAX_LENGTH,
      MAX_SAFE_INTEGER,
      MAX_SAFE_COMPONENT_LENGTH,
    }
  },
})

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  'node_modules/semver/internal/re.js'(exports2, module2) {
    var { MAX_SAFE_COMPONENT_LENGTH } = require_constants()
    var debug = require_debug()
    exports2 = module2.exports = {}
    var re = (exports2.re = [])
    var src = (exports2.src = [])
    var t = (exports2.t = {})
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
    exports2.tildeTrimReplace = '$1~'
    createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
    createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)
    createToken('LONECARET', '(?:\\^)')
    createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true)
    exports2.caretTrimReplace = '$1^'
    createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
    createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)
    createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
    createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)
    createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)
    exports2.comparatorTrimReplace = '$1$2$3'
    createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`)
    createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`)
    createToken('STAR', '(<|>)?=?\\s*\\*')
    createToken('GTE0', '^\\s*>=\\s*0.0.0\\s*$')
    createToken('GTE0PRE', '^\\s*>=\\s*0.0.0-0\\s*$')
  },
})

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  'node_modules/semver/internal/parse-options.js'(exports2, module2) {
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
    module2.exports = parseOptions
  },
})

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  'node_modules/semver/internal/identifiers.js'(exports2, module2) {
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
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers,
    }
  },
})

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  'node_modules/semver/classes/semver.js'(exports2, module2) {
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
    module2.exports = SemVer
  },
})

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  'node_modules/semver/functions/compare.js'(exports2, module2) {
    var SemVer = require_semver()
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose))
    module2.exports = compare
  },
})

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  'node_modules/semver/functions/lt.js'(exports2, module2) {
    var compare = require_compare()
    var lt = (a, b, loose) => compare(a, b, loose) < 0
    module2.exports = lt
  },
})

// node_modules/pluralize/pluralize.js
var require_pluralize = __commonJS({
  'node_modules/pluralize/pluralize.js'(exports2, module2) {
    ;(function (root, pluralize) {
      if (typeof require === 'function' && typeof exports2 === 'object' && typeof module2 === 'object') {
        module2.exports = pluralize()
      } else if (typeof define === 'function' && define.amd) {
        define(function () {
          return pluralize()
        })
      } else {
        root.pluralize = pluralize()
      }
    })(exports2, function () {
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
  'utils/hedStrings.js'(exports2, module2) {
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
    module2.exports = {
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
  'utils/types.js'(exports2, module2) {
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
    module2.exports = {
      Memoizer,
      MemoizerMixin,
    }
  },
})

// validator/parser/parsedHedSubstring.js
var require_parsedHedSubstring = __commonJS({
  'validator/parser/parsedHedSubstring.js'(exports2, module2) {
    var { Memoizer } = require_types2()
    var ParsedHedSubstring = class extends Memoizer {
      constructor(originalTag, originalBounds) {
        super()
        this.originalTag = originalTag
        this.originalBounds = originalBounds
      }
    }
    module2.exports = ParsedHedSubstring
  },
})

// validator/parser/parsedHedTag.js
var require_parsedHedTag = __commonJS({
  'validator/parser/parsedHedTag.js'(exports2, module2) {
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
    module2.exports = {
      ParsedHedTag,
      ParsedHed2Tag,
      ParsedHed3Tag,
    }
  },
})

// utils/hedData.js
var require_hedData = __commonJS({
  'utils/hedData.js'(exports2, module2) {
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
    module2.exports = {
      getGenerationForSchemaVersion,
      mergeParsingIssues,
      getParsedParentTags,
    }
  },
})

// common/schema/types.js
var require_types3 = __commonJS({
  'common/schema/types.js'(exports2, module2) {
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
    module2.exports = {
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
  'common/schema/index.js'(exports2, module2) {
    var config = require_config()
    var loadSchema = require_loader()
    var { Schema, Schemas } = require_types3()
    module2.exports = {
      loadSchema,
      Schema,
      Schemas,
      config,
    }
  },
})

// utils/xml2js.js
var require_xml2js2 = __commonJS({
  'utils/xml2js.js'(exports2, module2) {
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
    module2.exports = {
      setParent,
    }
  },
})

// converter/schema.js
var require_schema2 = __commonJS({
  'converter/schema.js'(exports2, module2) {
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
    module2.exports = {
      buildSchema,
      buildMappingObject,
    }
  },
})

// converter/index.js
var require_converter2 = __commonJS({
  'converter/index.js'(exports2, module2) {
    var { convertHedStringToLong, convertHedStringToShort } = require_converter()
    var { buildSchema } = require_schema2()
    module2.exports = {
      buildSchema,
      convertHedStringToShort,
      convertHedStringToLong,
    }
  },
})

// utils/index.js
var require_utils2 = __commonJS({
  'utils/index.js'(exports2, module2) {
    var HED = require_hedStrings()
    var array = require_array()
    var files = require_files()
    var string = require_string()
    module2.exports = {
      HED,
      array,
      files,
      string,
    }
  },
})

// node_modules/lodash/_freeGlobal.js
var require_freeGlobal = __commonJS({
  'node_modules/lodash/_freeGlobal.js'(exports2, module2) {
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global
    module2.exports = freeGlobal
  },
})

// node_modules/lodash/_root.js
var require_root = __commonJS({
  'node_modules/lodash/_root.js'(exports2, module2) {
    var freeGlobal = require_freeGlobal()
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self
    var root = freeGlobal || freeSelf || Function('return this')()
    module2.exports = root
  },
})

// node_modules/lodash/_Symbol.js
var require_Symbol = __commonJS({
  'node_modules/lodash/_Symbol.js'(exports2, module2) {
    var root = require_root()
    var Symbol2 = root.Symbol
    module2.exports = Symbol2
  },
})

// node_modules/lodash/_getRawTag.js
var require_getRawTag = __commonJS({
  'node_modules/lodash/_getRawTag.js'(exports2, module2) {
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
    module2.exports = getRawTag
  },
})

// node_modules/lodash/_objectToString.js
var require_objectToString = __commonJS({
  'node_modules/lodash/_objectToString.js'(exports2, module2) {
    var objectProto = Object.prototype
    var nativeObjectToString = objectProto.toString
    function objectToString(value) {
      return nativeObjectToString.call(value)
    }
    module2.exports = objectToString
  },
})

// node_modules/lodash/_baseGetTag.js
var require_baseGetTag = __commonJS({
  'node_modules/lodash/_baseGetTag.js'(exports2, module2) {
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
    module2.exports = baseGetTag
  },
})

// node_modules/lodash/isObject.js
var require_isObject = __commonJS({
  'node_modules/lodash/isObject.js'(exports2, module2) {
    function isObject(value) {
      var type = typeof value
      return value != null && (type == 'object' || type == 'function')
    }
    module2.exports = isObject
  },
})

// node_modules/lodash/isFunction.js
var require_isFunction = __commonJS({
  'node_modules/lodash/isFunction.js'(exports2, module2) {
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
    module2.exports = isFunction
  },
})

// node_modules/lodash/_coreJsData.js
var require_coreJsData = __commonJS({
  'node_modules/lodash/_coreJsData.js'(exports2, module2) {
    var root = require_root()
    var coreJsData = root['__core-js_shared__']
    module2.exports = coreJsData
  },
})

// node_modules/lodash/_isMasked.js
var require_isMasked = __commonJS({
  'node_modules/lodash/_isMasked.js'(exports2, module2) {
    var coreJsData = require_coreJsData()
    var maskSrcKey = (function () {
      var uid = /[^.]+$/.exec((coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO) || '')
      return uid ? 'Symbol(src)_1.' + uid : ''
    })()
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func
    }
    module2.exports = isMasked
  },
})

// node_modules/lodash/_toSource.js
var require_toSource = __commonJS({
  'node_modules/lodash/_toSource.js'(exports2, module2) {
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
    module2.exports = toSource
  },
})

// node_modules/lodash/_baseIsNative.js
var require_baseIsNative = __commonJS({
  'node_modules/lodash/_baseIsNative.js'(exports2, module2) {
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
    module2.exports = baseIsNative
  },
})

// node_modules/lodash/_getValue.js
var require_getValue = __commonJS({
  'node_modules/lodash/_getValue.js'(exports2, module2) {
    function getValue(object, key) {
      return object == null ? void 0 : object[key]
    }
    module2.exports = getValue
  },
})

// node_modules/lodash/_getNative.js
var require_getNative = __commonJS({
  'node_modules/lodash/_getNative.js'(exports2, module2) {
    var baseIsNative = require_baseIsNative()
    var getValue = require_getValue()
    function getNative(object, key) {
      var value = getValue(object, key)
      return baseIsNative(value) ? value : void 0
    }
    module2.exports = getNative
  },
})

// node_modules/lodash/_nativeCreate.js
var require_nativeCreate = __commonJS({
  'node_modules/lodash/_nativeCreate.js'(exports2, module2) {
    var getNative = require_getNative()
    var nativeCreate = getNative(Object, 'create')
    module2.exports = nativeCreate
  },
})

// node_modules/lodash/_hashClear.js
var require_hashClear = __commonJS({
  'node_modules/lodash/_hashClear.js'(exports2, module2) {
    var nativeCreate = require_nativeCreate()
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {}
      this.size = 0
    }
    module2.exports = hashClear
  },
})

// node_modules/lodash/_hashDelete.js
var require_hashDelete = __commonJS({
  'node_modules/lodash/_hashDelete.js'(exports2, module2) {
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key]
      this.size -= result ? 1 : 0
      return result
    }
    module2.exports = hashDelete
  },
})

// node_modules/lodash/_hashGet.js
var require_hashGet = __commonJS({
  'node_modules/lodash/_hashGet.js'(exports2, module2) {
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
    module2.exports = hashGet
  },
})

// node_modules/lodash/_hashHas.js
var require_hashHas = __commonJS({
  'node_modules/lodash/_hashHas.js'(exports2, module2) {
    var nativeCreate = require_nativeCreate()
    var objectProto = Object.prototype
    var hasOwnProperty = objectProto.hasOwnProperty
    function hashHas(key) {
      var data = this.__data__
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key)
    }
    module2.exports = hashHas
  },
})

// node_modules/lodash/_hashSet.js
var require_hashSet = __commonJS({
  'node_modules/lodash/_hashSet.js'(exports2, module2) {
    var nativeCreate = require_nativeCreate()
    var HASH_UNDEFINED = '__lodash_hash_undefined__'
    function hashSet(key, value) {
      var data = this.__data__
      this.size += this.has(key) ? 0 : 1
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value
      return this
    }
    module2.exports = hashSet
  },
})

// node_modules/lodash/_Hash.js
var require_Hash = __commonJS({
  'node_modules/lodash/_Hash.js'(exports2, module2) {
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
    module2.exports = Hash
  },
})

// node_modules/lodash/_listCacheClear.js
var require_listCacheClear = __commonJS({
  'node_modules/lodash/_listCacheClear.js'(exports2, module2) {
    function listCacheClear() {
      this.__data__ = []
      this.size = 0
    }
    module2.exports = listCacheClear
  },
})

// node_modules/lodash/eq.js
var require_eq = __commonJS({
  'node_modules/lodash/eq.js'(exports2, module2) {
    function eq(value, other) {
      return value === other || (value !== value && other !== other)
    }
    module2.exports = eq
  },
})

// node_modules/lodash/_assocIndexOf.js
var require_assocIndexOf = __commonJS({
  'node_modules/lodash/_assocIndexOf.js'(exports2, module2) {
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
    module2.exports = assocIndexOf
  },
})

// node_modules/lodash/_listCacheDelete.js
var require_listCacheDelete = __commonJS({
  'node_modules/lodash/_listCacheDelete.js'(exports2, module2) {
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
    module2.exports = listCacheDelete
  },
})

// node_modules/lodash/_listCacheGet.js
var require_listCacheGet = __commonJS({
  'node_modules/lodash/_listCacheGet.js'(exports2, module2) {
    var assocIndexOf = require_assocIndexOf()
    function listCacheGet(key) {
      var data = this.__data__,
        index = assocIndexOf(data, key)
      return index < 0 ? void 0 : data[index][1]
    }
    module2.exports = listCacheGet
  },
})

// node_modules/lodash/_listCacheHas.js
var require_listCacheHas = __commonJS({
  'node_modules/lodash/_listCacheHas.js'(exports2, module2) {
    var assocIndexOf = require_assocIndexOf()
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1
    }
    module2.exports = listCacheHas
  },
})

// node_modules/lodash/_listCacheSet.js
var require_listCacheSet = __commonJS({
  'node_modules/lodash/_listCacheSet.js'(exports2, module2) {
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
    module2.exports = listCacheSet
  },
})

// node_modules/lodash/_ListCache.js
var require_ListCache = __commonJS({
  'node_modules/lodash/_ListCache.js'(exports2, module2) {
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
    module2.exports = ListCache
  },
})

// node_modules/lodash/_Map.js
var require_Map = __commonJS({
  'node_modules/lodash/_Map.js'(exports2, module2) {
    var getNative = require_getNative()
    var root = require_root()
    var Map2 = getNative(root, 'Map')
    module2.exports = Map2
  },
})

// node_modules/lodash/_mapCacheClear.js
var require_mapCacheClear = __commonJS({
  'node_modules/lodash/_mapCacheClear.js'(exports2, module2) {
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
    module2.exports = mapCacheClear
  },
})

// node_modules/lodash/_isKeyable.js
var require_isKeyable = __commonJS({
  'node_modules/lodash/_isKeyable.js'(exports2, module2) {
    function isKeyable(value) {
      var type = typeof value
      return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean'
        ? value !== '__proto__'
        : value === null
    }
    module2.exports = isKeyable
  },
})

// node_modules/lodash/_getMapData.js
var require_getMapData = __commonJS({
  'node_modules/lodash/_getMapData.js'(exports2, module2) {
    var isKeyable = require_isKeyable()
    function getMapData(map, key) {
      var data = map.__data__
      return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map
    }
    module2.exports = getMapData
  },
})

// node_modules/lodash/_mapCacheDelete.js
var require_mapCacheDelete = __commonJS({
  'node_modules/lodash/_mapCacheDelete.js'(exports2, module2) {
    var getMapData = require_getMapData()
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key)
      this.size -= result ? 1 : 0
      return result
    }
    module2.exports = mapCacheDelete
  },
})

// node_modules/lodash/_mapCacheGet.js
var require_mapCacheGet = __commonJS({
  'node_modules/lodash/_mapCacheGet.js'(exports2, module2) {
    var getMapData = require_getMapData()
    function mapCacheGet(key) {
      return getMapData(this, key).get(key)
    }
    module2.exports = mapCacheGet
  },
})

// node_modules/lodash/_mapCacheHas.js
var require_mapCacheHas = __commonJS({
  'node_modules/lodash/_mapCacheHas.js'(exports2, module2) {
    var getMapData = require_getMapData()
    function mapCacheHas(key) {
      return getMapData(this, key).has(key)
    }
    module2.exports = mapCacheHas
  },
})

// node_modules/lodash/_mapCacheSet.js
var require_mapCacheSet = __commonJS({
  'node_modules/lodash/_mapCacheSet.js'(exports2, module2) {
    var getMapData = require_getMapData()
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
        size = data.size
      data.set(key, value)
      this.size += data.size == size ? 0 : 1
      return this
    }
    module2.exports = mapCacheSet
  },
})

// node_modules/lodash/_MapCache.js
var require_MapCache = __commonJS({
  'node_modules/lodash/_MapCache.js'(exports2, module2) {
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
    module2.exports = MapCache
  },
})

// node_modules/lodash/_setCacheAdd.js
var require_setCacheAdd = __commonJS({
  'node_modules/lodash/_setCacheAdd.js'(exports2, module2) {
    var HASH_UNDEFINED = '__lodash_hash_undefined__'
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED)
      return this
    }
    module2.exports = setCacheAdd
  },
})

// node_modules/lodash/_setCacheHas.js
var require_setCacheHas = __commonJS({
  'node_modules/lodash/_setCacheHas.js'(exports2, module2) {
    function setCacheHas(value) {
      return this.__data__.has(value)
    }
    module2.exports = setCacheHas
  },
})

// node_modules/lodash/_SetCache.js
var require_SetCache = __commonJS({
  'node_modules/lodash/_SetCache.js'(exports2, module2) {
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
    module2.exports = SetCache
  },
})

// node_modules/lodash/_baseFindIndex.js
var require_baseFindIndex = __commonJS({
  'node_modules/lodash/_baseFindIndex.js'(exports2, module2) {
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
    module2.exports = baseFindIndex
  },
})

// node_modules/lodash/_baseIsNaN.js
var require_baseIsNaN = __commonJS({
  'node_modules/lodash/_baseIsNaN.js'(exports2, module2) {
    function baseIsNaN(value) {
      return value !== value
    }
    module2.exports = baseIsNaN
  },
})

// node_modules/lodash/_strictIndexOf.js
var require_strictIndexOf = __commonJS({
  'node_modules/lodash/_strictIndexOf.js'(exports2, module2) {
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
    module2.exports = strictIndexOf
  },
})

// node_modules/lodash/_baseIndexOf.js
var require_baseIndexOf = __commonJS({
  'node_modules/lodash/_baseIndexOf.js'(exports2, module2) {
    var baseFindIndex = require_baseFindIndex()
    var baseIsNaN = require_baseIsNaN()
    var strictIndexOf = require_strictIndexOf()
    function baseIndexOf(array, value, fromIndex) {
      return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex)
    }
    module2.exports = baseIndexOf
  },
})

// node_modules/lodash/_arrayIncludes.js
var require_arrayIncludes = __commonJS({
  'node_modules/lodash/_arrayIncludes.js'(exports2, module2) {
    var baseIndexOf = require_baseIndexOf()
    function arrayIncludes(array, value) {
      var length = array == null ? 0 : array.length
      return !!length && baseIndexOf(array, value, 0) > -1
    }
    module2.exports = arrayIncludes
  },
})

// node_modules/lodash/_arrayIncludesWith.js
var require_arrayIncludesWith = __commonJS({
  'node_modules/lodash/_arrayIncludesWith.js'(exports2, module2) {
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
    module2.exports = arrayIncludesWith
  },
})

// node_modules/lodash/_arrayMap.js
var require_arrayMap = __commonJS({
  'node_modules/lodash/_arrayMap.js'(exports2, module2) {
    function arrayMap(array, iteratee) {
      var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length)
      while (++index < length) {
        result[index] = iteratee(array[index], index, array)
      }
      return result
    }
    module2.exports = arrayMap
  },
})

// node_modules/lodash/_baseUnary.js
var require_baseUnary = __commonJS({
  'node_modules/lodash/_baseUnary.js'(exports2, module2) {
    function baseUnary(func) {
      return function (value) {
        return func(value)
      }
    }
    module2.exports = baseUnary
  },
})

// node_modules/lodash/_cacheHas.js
var require_cacheHas = __commonJS({
  'node_modules/lodash/_cacheHas.js'(exports2, module2) {
    function cacheHas(cache, key) {
      return cache.has(key)
    }
    module2.exports = cacheHas
  },
})

// node_modules/lodash/_baseDifference.js
var require_baseDifference = __commonJS({
  'node_modules/lodash/_baseDifference.js'(exports2, module2) {
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
    module2.exports = baseDifference
  },
})

// node_modules/lodash/_arrayPush.js
var require_arrayPush = __commonJS({
  'node_modules/lodash/_arrayPush.js'(exports2, module2) {
    function arrayPush(array, values) {
      var index = -1,
        length = values.length,
        offset = array.length
      while (++index < length) {
        array[offset + index] = values[index]
      }
      return array
    }
    module2.exports = arrayPush
  },
})

// node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS({
  'node_modules/lodash/isObjectLike.js'(exports2, module2) {
    function isObjectLike(value) {
      return value != null && typeof value == 'object'
    }
    module2.exports = isObjectLike
  },
})

// node_modules/lodash/_baseIsArguments.js
var require_baseIsArguments = __commonJS({
  'node_modules/lodash/_baseIsArguments.js'(exports2, module2) {
    var baseGetTag = require_baseGetTag()
    var isObjectLike = require_isObjectLike()
    var argsTag = '[object Arguments]'
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag
    }
    module2.exports = baseIsArguments
  },
})

// node_modules/lodash/isArguments.js
var require_isArguments = __commonJS({
  'node_modules/lodash/isArguments.js'(exports2, module2) {
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
    module2.exports = isArguments
  },
})

// node_modules/lodash/isArray.js
var require_isArray = __commonJS({
  'node_modules/lodash/isArray.js'(exports2, module2) {
    var isArray = Array.isArray
    module2.exports = isArray
  },
})

// node_modules/lodash/_isFlattenable.js
var require_isFlattenable = __commonJS({
  'node_modules/lodash/_isFlattenable.js'(exports2, module2) {
    var Symbol2 = require_Symbol()
    var isArguments = require_isArguments()
    var isArray = require_isArray()
    var spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : void 0
    function isFlattenable(value) {
      return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol])
    }
    module2.exports = isFlattenable
  },
})

// node_modules/lodash/_baseFlatten.js
var require_baseFlatten = __commonJS({
  'node_modules/lodash/_baseFlatten.js'(exports2, module2) {
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
    module2.exports = baseFlatten
  },
})

// node_modules/lodash/identity.js
var require_identity = __commonJS({
  'node_modules/lodash/identity.js'(exports2, module2) {
    function identity(value) {
      return value
    }
    module2.exports = identity
  },
})

// node_modules/lodash/_apply.js
var require_apply = __commonJS({
  'node_modules/lodash/_apply.js'(exports2, module2) {
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
    module2.exports = apply
  },
})

// node_modules/lodash/_overRest.js
var require_overRest = __commonJS({
  'node_modules/lodash/_overRest.js'(exports2, module2) {
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
    module2.exports = overRest
  },
})

// node_modules/lodash/constant.js
var require_constant = __commonJS({
  'node_modules/lodash/constant.js'(exports2, module2) {
    function constant(value) {
      return function () {
        return value
      }
    }
    module2.exports = constant
  },
})

// node_modules/lodash/_defineProperty.js
var require_defineProperty = __commonJS({
  'node_modules/lodash/_defineProperty.js'(exports2, module2) {
    var getNative = require_getNative()
    var defineProperty = (function () {
      try {
        var func = getNative(Object, 'defineProperty')
        func({}, '', {})
        return func
      } catch (e) {}
    })()
    module2.exports = defineProperty
  },
})

// node_modules/lodash/_baseSetToString.js
var require_baseSetToString = __commonJS({
  'node_modules/lodash/_baseSetToString.js'(exports2, module2) {
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
    module2.exports = baseSetToString
  },
})

// node_modules/lodash/_shortOut.js
var require_shortOut = __commonJS({
  'node_modules/lodash/_shortOut.js'(exports2, module2) {
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
    module2.exports = shortOut
  },
})

// node_modules/lodash/_setToString.js
var require_setToString = __commonJS({
  'node_modules/lodash/_setToString.js'(exports2, module2) {
    var baseSetToString = require_baseSetToString()
    var shortOut = require_shortOut()
    var setToString = shortOut(baseSetToString)
    module2.exports = setToString
  },
})

// node_modules/lodash/_baseRest.js
var require_baseRest = __commonJS({
  'node_modules/lodash/_baseRest.js'(exports2, module2) {
    var identity = require_identity()
    var overRest = require_overRest()
    var setToString = require_setToString()
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + '')
    }
    module2.exports = baseRest
  },
})

// node_modules/lodash/isLength.js
var require_isLength = __commonJS({
  'node_modules/lodash/isLength.js'(exports2, module2) {
    var MAX_SAFE_INTEGER = 9007199254740991
    function isLength(value) {
      return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER
    }
    module2.exports = isLength
  },
})

// node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS({
  'node_modules/lodash/isArrayLike.js'(exports2, module2) {
    var isFunction = require_isFunction()
    var isLength = require_isLength()
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value)
    }
    module2.exports = isArrayLike
  },
})

// node_modules/lodash/isArrayLikeObject.js
var require_isArrayLikeObject = __commonJS({
  'node_modules/lodash/isArrayLikeObject.js'(exports2, module2) {
    var isArrayLike = require_isArrayLike()
    var isObjectLike = require_isObjectLike()
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value)
    }
    module2.exports = isArrayLikeObject
  },
})

// node_modules/lodash/last.js
var require_last = __commonJS({
  'node_modules/lodash/last.js'(exports2, module2) {
    function last(array) {
      var length = array == null ? 0 : array.length
      return length ? array[length - 1] : void 0
    }
    module2.exports = last
  },
})

// node_modules/lodash/differenceWith.js
var require_differenceWith = __commonJS({
  'node_modules/lodash/differenceWith.js'(exports2, module2) {
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
    module2.exports = differenceWith
  },
})

// validator/parser/parsedHedGroup.js
var require_parsedHedGroup = __commonJS({
  'validator/parser/parsedHedGroup.js'(exports2, module2) {
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
    module2.exports = ParsedHedGroup
  },
})

// validator/parser/parsedHedString.js
var require_parsedHedString = __commonJS({
  'validator/parser/parsedHedString.js'(exports2, module2) {
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
    module2.exports = ParsedHedString
  },
})

// node_modules/lodash/flattenDeep.js
var require_flattenDeep = __commonJS({
  'node_modules/lodash/flattenDeep.js'(exports2, module2) {
    var baseFlatten = require_baseFlatten()
    var INFINITY = 1 / 0
    function flattenDeep(array) {
      var length = array == null ? 0 : array.length
      return length ? baseFlatten(array, INFINITY) : []
    }
    module2.exports = flattenDeep
  },
})

// validator/parser/splitHedString.js
var require_splitHedString2 = __commonJS({
  'validator/parser/splitHedString.js'(exports2, module2) {
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
    module2.exports = splitHedString
  },
})

// validator/parser/main.js
var require_main = __commonJS({
  'validator/parser/main.js'(exports2, module2) {
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
    module2.exports = {
      splitHedString,
      parseHedString,
      parseHedStrings,
    }
  },
})

// utils/bids.js
var require_bids = __commonJS({
  'utils/bids.js'(exports2, module2) {
    var sidecarValueHasHed = function (sidecarValue) {
      return sidecarValue !== null && typeof sidecarValue === 'object' && sidecarValue.HED !== void 0
    }
    module2.exports = {
      sidecarValueHasHed,
    }
  },
})

// validator/bids/types.js
var require_types4 = __commonJS({
  'validator/bids/types.js'(exports2, module2) {
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
    module2.exports = {
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
  'validator/event/validator.js'(exports2, module2) {
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
    module2.exports = {
      HedValidator,
      Hed2Validator,
    }
  },
})

// validator/event/hed3.js
var require_hed3 = __commonJS({
  'validator/event/hed3.js'(exports2, module2) {
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
    module2.exports = {
      Hed3Validator,
    }
  },
})

// validator/event/init.js
var require_init = __commonJS({
  'validator/event/init.js'(exports2, module2) {
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
    module2.exports = {
      validateHedString,
      validateHedEvent,
      validateHedEventWithDefinitions,
    }
  },
})

// validator/event/index.js
var require_event = __commonJS({
  'validator/event/index.js'(exports2, module2) {
    var { validateHedString, validateHedEvent, validateHedEventWithDefinitions } = require_init()
    var { HedValidator, Hed2Validator } = require_validator()
    var { Hed3Validator } = require_hed3()
    module2.exports = {
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
  'node_modules/lodash/_stackClear.js'(exports2, module2) {
    var ListCache = require_ListCache()
    function stackClear() {
      this.__data__ = new ListCache()
      this.size = 0
    }
    module2.exports = stackClear
  },
})

// node_modules/lodash/_stackDelete.js
var require_stackDelete = __commonJS({
  'node_modules/lodash/_stackDelete.js'(exports2, module2) {
    function stackDelete(key) {
      var data = this.__data__,
        result = data['delete'](key)
      this.size = data.size
      return result
    }
    module2.exports = stackDelete
  },
})

// node_modules/lodash/_stackGet.js
var require_stackGet = __commonJS({
  'node_modules/lodash/_stackGet.js'(exports2, module2) {
    function stackGet(key) {
      return this.__data__.get(key)
    }
    module2.exports = stackGet
  },
})

// node_modules/lodash/_stackHas.js
var require_stackHas = __commonJS({
  'node_modules/lodash/_stackHas.js'(exports2, module2) {
    function stackHas(key) {
      return this.__data__.has(key)
    }
    module2.exports = stackHas
  },
})

// node_modules/lodash/_stackSet.js
var require_stackSet = __commonJS({
  'node_modules/lodash/_stackSet.js'(exports2, module2) {
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
    module2.exports = stackSet
  },
})

// node_modules/lodash/_Stack.js
var require_Stack = __commonJS({
  'node_modules/lodash/_Stack.js'(exports2, module2) {
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
    module2.exports = Stack
  },
})

// node_modules/lodash/_arraySome.js
var require_arraySome = __commonJS({
  'node_modules/lodash/_arraySome.js'(exports2, module2) {
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
    module2.exports = arraySome
  },
})

// node_modules/lodash/_equalArrays.js
var require_equalArrays = __commonJS({
  'node_modules/lodash/_equalArrays.js'(exports2, module2) {
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
    module2.exports = equalArrays
  },
})

// node_modules/lodash/_Uint8Array.js
var require_Uint8Array = __commonJS({
  'node_modules/lodash/_Uint8Array.js'(exports2, module2) {
    var root = require_root()
    var Uint8Array2 = root.Uint8Array
    module2.exports = Uint8Array2
  },
})

// node_modules/lodash/_mapToArray.js
var require_mapToArray = __commonJS({
  'node_modules/lodash/_mapToArray.js'(exports2, module2) {
    function mapToArray(map) {
      var index = -1,
        result = Array(map.size)
      map.forEach(function (value, key) {
        result[++index] = [key, value]
      })
      return result
    }
    module2.exports = mapToArray
  },
})

// node_modules/lodash/_setToArray.js
var require_setToArray = __commonJS({
  'node_modules/lodash/_setToArray.js'(exports2, module2) {
    function setToArray(set) {
      var index = -1,
        result = Array(set.size)
      set.forEach(function (value) {
        result[++index] = value
      })
      return result
    }
    module2.exports = setToArray
  },
})

// node_modules/lodash/_equalByTag.js
var require_equalByTag = __commonJS({
  'node_modules/lodash/_equalByTag.js'(exports2, module2) {
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
    module2.exports = equalByTag
  },
})

// node_modules/lodash/_baseGetAllKeys.js
var require_baseGetAllKeys = __commonJS({
  'node_modules/lodash/_baseGetAllKeys.js'(exports2, module2) {
    var arrayPush = require_arrayPush()
    var isArray = require_isArray()
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object)
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object))
    }
    module2.exports = baseGetAllKeys
  },
})

// node_modules/lodash/_arrayFilter.js
var require_arrayFilter = __commonJS({
  'node_modules/lodash/_arrayFilter.js'(exports2, module2) {
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
    module2.exports = arrayFilter
  },
})

// node_modules/lodash/stubArray.js
var require_stubArray = __commonJS({
  'node_modules/lodash/stubArray.js'(exports2, module2) {
    function stubArray() {
      return []
    }
    module2.exports = stubArray
  },
})

// node_modules/lodash/_getSymbols.js
var require_getSymbols = __commonJS({
  'node_modules/lodash/_getSymbols.js'(exports2, module2) {
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
    module2.exports = getSymbols
  },
})

// node_modules/lodash/_baseTimes.js
var require_baseTimes = __commonJS({
  'node_modules/lodash/_baseTimes.js'(exports2, module2) {
    function baseTimes(n, iteratee) {
      var index = -1,
        result = Array(n)
      while (++index < n) {
        result[index] = iteratee(index)
      }
      return result
    }
    module2.exports = baseTimes
  },
})

// node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS({
  'node_modules/lodash/stubFalse.js'(exports2, module2) {
    function stubFalse() {
      return false
    }
    module2.exports = stubFalse
  },
})

// node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS({
  'node_modules/lodash/isBuffer.js'(exports2, module2) {
    var root = require_root()
    var stubFalse = require_stubFalse()
    var freeExports = typeof exports2 == 'object' && exports2 && !exports2.nodeType && exports2
    var freeModule = freeExports && typeof module2 == 'object' && module2 && !module2.nodeType && module2
    var moduleExports = freeModule && freeModule.exports === freeExports
    var Buffer2 = moduleExports ? root.Buffer : void 0
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0
    var isBuffer = nativeIsBuffer || stubFalse
    module2.exports = isBuffer
  },
})

// node_modules/lodash/_isIndex.js
var require_isIndex = __commonJS({
  'node_modules/lodash/_isIndex.js'(exports2, module2) {
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
    module2.exports = isIndex
  },
})

// node_modules/lodash/_baseIsTypedArray.js
var require_baseIsTypedArray = __commonJS({
  'node_modules/lodash/_baseIsTypedArray.js'(exports2, module2) {
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
    module2.exports = baseIsTypedArray
  },
})

// node_modules/lodash/_nodeUtil.js
var require_nodeUtil = __commonJS({
  'node_modules/lodash/_nodeUtil.js'(exports2, module2) {
    var freeGlobal = require_freeGlobal()
    var freeExports = typeof exports2 == 'object' && exports2 && !exports2.nodeType && exports2
    var freeModule = freeExports && typeof module2 == 'object' && module2 && !module2.nodeType && module2
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
    module2.exports = nodeUtil
  },
})

// node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS({
  'node_modules/lodash/isTypedArray.js'(exports2, module2) {
    var baseIsTypedArray = require_baseIsTypedArray()
    var baseUnary = require_baseUnary()
    var nodeUtil = require_nodeUtil()
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray
    module2.exports = isTypedArray
  },
})

// node_modules/lodash/_arrayLikeKeys.js
var require_arrayLikeKeys = __commonJS({
  'node_modules/lodash/_arrayLikeKeys.js'(exports2, module2) {
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
    module2.exports = arrayLikeKeys
  },
})

// node_modules/lodash/_isPrototype.js
var require_isPrototype = __commonJS({
  'node_modules/lodash/_isPrototype.js'(exports2, module2) {
    var objectProto = Object.prototype
    function isPrototype(value) {
      var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto
      return value === proto
    }
    module2.exports = isPrototype
  },
})

// node_modules/lodash/_overArg.js
var require_overArg = __commonJS({
  'node_modules/lodash/_overArg.js'(exports2, module2) {
    function overArg(func, transform) {
      return function (arg) {
        return func(transform(arg))
      }
    }
    module2.exports = overArg
  },
})

// node_modules/lodash/_nativeKeys.js
var require_nativeKeys = __commonJS({
  'node_modules/lodash/_nativeKeys.js'(exports2, module2) {
    var overArg = require_overArg()
    var nativeKeys = overArg(Object.keys, Object)
    module2.exports = nativeKeys
  },
})

// node_modules/lodash/_baseKeys.js
var require_baseKeys = __commonJS({
  'node_modules/lodash/_baseKeys.js'(exports2, module2) {
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
    module2.exports = baseKeys
  },
})

// node_modules/lodash/keys.js
var require_keys = __commonJS({
  'node_modules/lodash/keys.js'(exports2, module2) {
    var arrayLikeKeys = require_arrayLikeKeys()
    var baseKeys = require_baseKeys()
    var isArrayLike = require_isArrayLike()
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object)
    }
    module2.exports = keys
  },
})

// node_modules/lodash/_getAllKeys.js
var require_getAllKeys = __commonJS({
  'node_modules/lodash/_getAllKeys.js'(exports2, module2) {
    var baseGetAllKeys = require_baseGetAllKeys()
    var getSymbols = require_getSymbols()
    var keys = require_keys()
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols)
    }
    module2.exports = getAllKeys
  },
})

// node_modules/lodash/_equalObjects.js
var require_equalObjects = __commonJS({
  'node_modules/lodash/_equalObjects.js'(exports2, module2) {
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
    module2.exports = equalObjects
  },
})

// node_modules/lodash/_DataView.js
var require_DataView = __commonJS({
  'node_modules/lodash/_DataView.js'(exports2, module2) {
    var getNative = require_getNative()
    var root = require_root()
    var DataView2 = getNative(root, 'DataView')
    module2.exports = DataView2
  },
})

// node_modules/lodash/_Promise.js
var require_Promise = __commonJS({
  'node_modules/lodash/_Promise.js'(exports2, module2) {
    var getNative = require_getNative()
    var root = require_root()
    var Promise2 = getNative(root, 'Promise')
    module2.exports = Promise2
  },
})

// node_modules/lodash/_Set.js
var require_Set = __commonJS({
  'node_modules/lodash/_Set.js'(exports2, module2) {
    var getNative = require_getNative()
    var root = require_root()
    var Set2 = getNative(root, 'Set')
    module2.exports = Set2
  },
})

// node_modules/lodash/_WeakMap.js
var require_WeakMap = __commonJS({
  'node_modules/lodash/_WeakMap.js'(exports2, module2) {
    var getNative = require_getNative()
    var root = require_root()
    var WeakMap2 = getNative(root, 'WeakMap')
    module2.exports = WeakMap2
  },
})

// node_modules/lodash/_getTag.js
var require_getTag = __commonJS({
  'node_modules/lodash/_getTag.js'(exports2, module2) {
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
    module2.exports = getTag
  },
})

// node_modules/lodash/_baseIsEqualDeep.js
var require_baseIsEqualDeep = __commonJS({
  'node_modules/lodash/_baseIsEqualDeep.js'(exports2, module2) {
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
    module2.exports = baseIsEqualDeep
  },
})

// node_modules/lodash/_baseIsEqual.js
var require_baseIsEqual = __commonJS({
  'node_modules/lodash/_baseIsEqual.js'(exports2, module2) {
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
    module2.exports = baseIsEqual
  },
})

// node_modules/lodash/isEqual.js
var require_isEqual = __commonJS({
  'node_modules/lodash/isEqual.js'(exports2, module2) {
    var baseIsEqual = require_baseIsEqual()
    function isEqual(value, other) {
      return baseIsEqual(value, other)
    }
    module2.exports = isEqual
  },
})

// utils/map.js
var require_map = __commonJS({
  'utils/map.js'(exports2, module2) {
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
    module2.exports = {
      filterNonEqualDuplicates,
    }
  },
})

// validator/dataset.js
var require_dataset = __commonJS({
  'validator/dataset.js'(exports2, module2) {
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
    module2.exports = {
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
  'node_modules/semver/functions/parse.js'(exports2, module2) {
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
    module2.exports = parse
  },
})

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  'node_modules/semver/functions/valid.js'(exports2, module2) {
    var parse = require_parse2()
    var valid = (version, options) => {
      const v = parse(version, options)
      return v ? v.version : null
    }
    module2.exports = valid
  },
})

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  'node_modules/semver/functions/clean.js'(exports2, module2) {
    var parse = require_parse2()
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ''), options)
      return s ? s.version : null
    }
    module2.exports = clean
  },
})

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  'node_modules/semver/functions/inc.js'(exports2, module2) {
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
    module2.exports = inc
  },
})

// node_modules/semver/functions/eq.js
var require_eq2 = __commonJS({
  'node_modules/semver/functions/eq.js'(exports2, module2) {
    var compare = require_compare()
    var eq = (a, b, loose) => compare(a, b, loose) === 0
    module2.exports = eq
  },
})

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  'node_modules/semver/functions/diff.js'(exports2, module2) {
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
    module2.exports = diff
  },
})

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  'node_modules/semver/functions/major.js'(exports2, module2) {
    var SemVer = require_semver()
    var major = (a, loose) => new SemVer(a, loose).major
    module2.exports = major
  },
})

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  'node_modules/semver/functions/minor.js'(exports2, module2) {
    var SemVer = require_semver()
    var minor = (a, loose) => new SemVer(a, loose).minor
    module2.exports = minor
  },
})

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  'node_modules/semver/functions/patch.js'(exports2, module2) {
    var SemVer = require_semver()
    var patch = (a, loose) => new SemVer(a, loose).patch
    module2.exports = patch
  },
})

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  'node_modules/semver/functions/prerelease.js'(exports2, module2) {
    var parse = require_parse2()
    var prerelease = (version, options) => {
      const parsed = parse(version, options)
      return parsed && parsed.prerelease.length ? parsed.prerelease : null
    }
    module2.exports = prerelease
  },
})

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  'node_modules/semver/functions/rcompare.js'(exports2, module2) {
    var compare = require_compare()
    var rcompare = (a, b, loose) => compare(b, a, loose)
    module2.exports = rcompare
  },
})

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  'node_modules/semver/functions/compare-loose.js'(exports2, module2) {
    var compare = require_compare()
    var compareLoose = (a, b) => compare(a, b, true)
    module2.exports = compareLoose
  },
})

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  'node_modules/semver/functions/compare-build.js'(exports2, module2) {
    var SemVer = require_semver()
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose)
      const versionB = new SemVer(b, loose)
      return versionA.compare(versionB) || versionA.compareBuild(versionB)
    }
    module2.exports = compareBuild
  },
})

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  'node_modules/semver/functions/sort.js'(exports2, module2) {
    var compareBuild = require_compare_build()
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose))
    module2.exports = sort
  },
})

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  'node_modules/semver/functions/rsort.js'(exports2, module2) {
    var compareBuild = require_compare_build()
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose))
    module2.exports = rsort
  },
})

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  'node_modules/semver/functions/gt.js'(exports2, module2) {
    var compare = require_compare()
    var gt = (a, b, loose) => compare(a, b, loose) > 0
    module2.exports = gt
  },
})

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  'node_modules/semver/functions/neq.js'(exports2, module2) {
    var compare = require_compare()
    var neq = (a, b, loose) => compare(a, b, loose) !== 0
    module2.exports = neq
  },
})

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  'node_modules/semver/functions/gte.js'(exports2, module2) {
    var compare = require_compare()
    var gte = (a, b, loose) => compare(a, b, loose) >= 0
    module2.exports = gte
  },
})

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  'node_modules/semver/functions/lte.js'(exports2, module2) {
    var compare = require_compare()
    var lte = (a, b, loose) => compare(a, b, loose) <= 0
    module2.exports = lte
  },
})

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  'node_modules/semver/functions/cmp.js'(exports2, module2) {
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
    module2.exports = cmp
  },
})

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  'node_modules/semver/functions/coerce.js'(exports2, module2) {
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
    module2.exports = coerce
  },
})

// node_modules/yallist/iterator.js
var require_iterator = __commonJS({
  'node_modules/yallist/iterator.js'(exports2, module2) {
    'use strict'
    module2.exports = function (Yallist) {
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
  'node_modules/yallist/yallist.js'(exports2, module2) {
    'use strict'
    module2.exports = Yallist
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
  'node_modules/lru-cache/index.js'(exports2, module2) {
    'use strict'
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
    module2.exports = LRUCache
  },
})

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  'node_modules/semver/classes/range.js'(exports2, module2) {
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
    module2.exports = Range
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
  'node_modules/semver/classes/comparator.js'(exports2, module2) {
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
    module2.exports = Comparator
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
  'node_modules/semver/functions/satisfies.js'(exports2, module2) {
    var Range = require_range()
    var satisfies = (version, range, options) => {
      try {
        range = new Range(range, options)
      } catch (er) {
        return false
      }
      return range.test(version)
    }
    module2.exports = satisfies
  },
})

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  'node_modules/semver/ranges/to-comparators.js'(exports2, module2) {
    var Range = require_range()
    var toComparators = (range, options) =>
      new Range(range, options).set.map((comp) =>
        comp
          .map((c) => c.value)
          .join(' ')
          .trim()
          .split(' '),
      )
    module2.exports = toComparators
  },
})

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  'node_modules/semver/ranges/max-satisfying.js'(exports2, module2) {
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
    module2.exports = maxSatisfying
  },
})

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  'node_modules/semver/ranges/min-satisfying.js'(exports2, module2) {
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
    module2.exports = minSatisfying
  },
})

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  'node_modules/semver/ranges/min-version.js'(exports2, module2) {
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
    module2.exports = minVersion
  },
})

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  'node_modules/semver/ranges/valid.js'(exports2, module2) {
    var Range = require_range()
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || '*'
      } catch (er) {
        return null
      }
    }
    module2.exports = validRange
  },
})

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  'node_modules/semver/ranges/outside.js'(exports2, module2) {
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
    module2.exports = outside
  },
})

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  'node_modules/semver/ranges/gtr.js'(exports2, module2) {
    var outside = require_outside()
    var gtr = (version, range, options) => outside(version, range, '>', options)
    module2.exports = gtr
  },
})

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  'node_modules/semver/ranges/ltr.js'(exports2, module2) {
    var outside = require_outside()
    var ltr = (version, range, options) => outside(version, range, '<', options)
    module2.exports = ltr
  },
})

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  'node_modules/semver/ranges/intersects.js'(exports2, module2) {
    var Range = require_range()
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options)
      r2 = new Range(r2, options)
      return r1.intersects(r2)
    }
    module2.exports = intersects
  },
})

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  'node_modules/semver/ranges/simplify.js'(exports2, module2) {
    var satisfies = require_satisfies()
    var compare = require_compare()
    module2.exports = (versions, range, options) => {
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
  'node_modules/semver/ranges/subset.js'(exports2, module2) {
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
    module2.exports = subset
  },
})

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  'node_modules/semver/index.js'(exports2, module2) {
    var internalRe = require_re()
    module2.exports = {
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
  'node_modules/lodash/_baseProperty.js'(exports2, module2) {
    function baseProperty(key) {
      return function (object) {
        return object == null ? void 0 : object[key]
      }
    }
    module2.exports = baseProperty
  },
})

// node_modules/lodash/unzip.js
var require_unzip = __commonJS({
  'node_modules/lodash/unzip.js'(exports2, module2) {
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
    module2.exports = unzip
  },
})

// node_modules/lodash/zip.js
var require_zip = __commonJS({
  'node_modules/lodash/zip.js'(exports2, module2) {
    var baseRest = require_baseRest()
    var unzip = require_unzip()
    var zip = baseRest(unzip)
    module2.exports = zip
  },
})

// validator/schema/types.js
var require_types5 = __commonJS({
  'validator/schema/types.js'(exports2, module2) {
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
    module2.exports = {
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
  'validator/schema/parser.js'(exports2, module2) {
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
    module2.exports = {
      SchemaParser,
    }
  },
})

// validator/schema/hed2.js
var require_hed2 = __commonJS({
  'validator/schema/hed2.js'(exports2, module2) {
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
    module2.exports = {
      Hed2SchemaParser,
    }
  },
})

// validator/schema/hed3.js
var require_hed32 = __commonJS({
  'validator/schema/hed3.js'(exports2, module2) {
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
    module2.exports = {
      Hed3SchemaParser,
      HedV8SchemaParser,
    }
  },
})

// validator/schema/init.js
var require_init2 = __commonJS({
  'validator/schema/init.js'(exports2, module2) {
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
    module2.exports = {
      buildSchema,
      buildSchemas,
      buildSchemaAttributesObject,
    }
  },
})

// validator/bids/schema.js
var require_schema3 = __commonJS({
  'validator/bids/schema.js'(exports2, module2) {
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
    module2.exports = {
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
  'validator/bids/validate.js'(exports2, module2) {
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
    module2.exports = { validateBidsDataset }
  },
})

// validator/bids/index.js
var require_bids2 = __commonJS({
  'validator/bids/index.js'(exports2, module2) {
    var { BidsDataset, BidsEventFile, BidsHedIssue, BidsIssue, BidsJsonFile, BidsSidecar } = require_types4()
    var { validateBidsDataset } = require_validate()
    module2.exports = {
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
  'validator/index.js'(exports2, module2) {
    var { BidsDataset, BidsEventFile, BidsJsonFile, BidsSidecar, validateBidsDataset } = require_bids2()
    var { validateHedDataset } = require_dataset()
    var { validateHedEvent, validateHedString } = require_event()
    var { buildSchema, buildSchemas } = require_init2()
    module2.exports = {
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
var converter = require_converter2()
var validator = require_validator2()
module.exports = {
  converter,
  validator,
}
/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
/*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
/**
 * @preserve date-and-time.js (c) KNOWLEDGECODE | MIT
 */
//# sourceMappingURL=index.js.map
