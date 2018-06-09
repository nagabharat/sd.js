// Copyright 2017 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

'use strict';

// DO NOT EDIT: auto-generated by ./support/build-runtime.js

/* tslint:disable: max-line-length */

export const preamble =
  "'use strict';\nfunction i32(n) {\n    'use strict';\n    return n | 0;\n}\nclass Simulation {\n    lookupOffset(id) {\n        if (id === 'time')\n            return 0;\n        if (id[0] === '.')\n            id = id.substr(1);\n        if (id in this.offsets)\n            return this._shift + this.offsets[id];\n        let parts = id.split('.');\n        if (parts.length === 1 && id === \"\" && this.name in this.offsets)\n            return this._shift + this.offsets[this.name];\n        const nextSim = this.modules[parts[0]];\n        if (!nextSim)\n            return -1;\n        return nextSim.lookupOffset(parts.slice(1).join('.'));\n    }\n    root() {\n        if (!this.parent)\n            return this;\n        return this.parent.root();\n    }\n    resolveAllSymbolicRefs() {\n        for (let n in this.symRefs) {\n            if (!this.symRefs.hasOwnProperty(n))\n                continue;\n            let ctx;\n            if (this.symRefs[n][0] === '.' || this === this.root()) {\n                ctx = this.root();\n            }\n            else {\n                ctx = this.parent;\n            }\n            this.ref[n] = ctx.lookupOffset(this.symRefs[n]);\n        }\n        for (let n in this.modules) {\n            if (!this.modules.hasOwnProperty(n))\n                continue;\n            this.modules[n].resolveAllSymbolicRefs();\n        }\n    }\n    varNames(includeHidden) {\n        let result = Object.keys(this.offsets)\n            .filter(v => (includeHidden || !v.startsWith('$·')));\n        for (let v in this.modules) {\n            if (!this.modules.hasOwnProperty(v))\n                continue;\n            if (!includeHidden && v.startsWith('$·'))\n                continue;\n            let ids = [];\n            let modVarNames = this.modules[v].varNames(includeHidden);\n            for (let n in modVarNames) {\n                if (modVarNames.hasOwnProperty(n))\n                    ids.push(v + '.' + modVarNames[n]);\n            }\n            result = result.concat(ids);\n        }\n        if (this.name === 'main')\n            result.push('time');\n        return result;\n    }\n    getNVars() {\n        let nVars = Object.keys(this.offsets).length;\n        for (let n in this.modules) {\n            if (this.modules.hasOwnProperty(n))\n                nVars += this.modules[n].getNVars();\n        }\n        if (this.name === 'main')\n            nVars++;\n        return nVars;\n    }\n    reset() {\n        const spec = this.simSpec;\n        const nSaveSteps = i32((spec.stop - spec.start) / spec.saveStep + 1);\n        this.stepNum = 0;\n        this.slab = new Float64Array(this.nVars * (nSaveSteps + 1));\n        let curr = this.curr();\n        curr[0] = spec.start;\n        this.saveEvery = Math.max(1, i32(spec.saveStep / spec.dt + 0.5));\n        this.calcInitial(this.simSpec.dt, curr);\n    }\n    dominance(forced, indicators) {\n        const dt = this.simSpec.dt;\n        let curr = this.curr().slice();\n        let next = new Float64Array(curr.length);\n        for (let name in forced) {\n            if (!forced.hasOwnProperty(name))\n                continue;\n            let off = this.lookupOffset(name);\n            if (off === -1) {\n                console.log(`WARNING: variable '${name}' not found.`);\n                return {};\n            }\n            curr[off] = forced[name];\n        }\n        this.calcFlows(dt, curr);\n        this.calcStocks(dt, curr, next);\n        next[0] = curr[0] + dt;\n        let result = {};\n        for (let i = 0; i < indicators.length; i++) {\n            let name = indicators[i];\n            let off = this.lookupOffset(name);\n            if (off === -1) {\n                console.log(`WARNING: variable '${name}' not found.`);\n                continue;\n            }\n            result[name] = next[off];\n        }\n        return result;\n    }\n    runTo(endTime) {\n        const dt = this.simSpec.dt;\n        let curr = this.curr();\n        let next = this.slab.subarray((this.stepNum + 1) * this.nVars, (this.stepNum + 2) * this.nVars);\n        while (curr[0] <= endTime) {\n            this.calcFlows(dt, curr);\n            this.calcStocks(dt, curr, next);\n            next[0] = curr[0] + dt;\n            if (this.stepNum++ % this.saveEvery !== 0) {\n                curr.set(next);\n            }\n            else {\n                curr = next;\n                next = this.slab.subarray((i32(this.stepNum / this.saveEvery) + 1) * this.nVars, (i32(this.stepNum / this.saveEvery) + 2) * this.nVars);\n            }\n        }\n    }\n    runToEnd() {\n        return this.runTo(this.simSpec.stop + 0.5 * this.simSpec.dt);\n    }\n    curr() {\n        return this.slab.subarray((this.stepNum) * this.nVars, (this.stepNum + 1) * this.nVars);\n    }\n    setValue(name, value) {\n        const off = this.lookupOffset(name);\n        if (off === -1)\n            return;\n        this.curr()[off] = value;\n    }\n    value(name) {\n        const off = this.lookupOffset(name);\n        if (off === -1)\n            return NaN;\n        const saveNum = i32(this.stepNum / this.saveEvery);\n        const slabOff = this.nVars * saveNum;\n        return this.slab.subarray(slabOff, slabOff + this.nVars)[off];\n    }\n    series(name) {\n        const saveNum = i32(this.stepNum / this.saveEvery);\n        const time = new Float64Array(saveNum);\n        const values = new Float64Array(saveNum);\n        const off = this.lookupOffset(name);\n        if (off === -1)\n            return null;\n        for (let i = 0; i < time.length; i++) {\n            let curr = this.slab.subarray(i * this.nVars, (i + 1) * this.nVars);\n            time[i] = curr[0];\n            values[i] = curr[off];\n        }\n        return {\n            'name': name,\n            'time': time,\n            'values': values,\n        };\n    }\n}\nlet cmds;\nfunction handleMessage(e) {\n    'use strict';\n    let id = e.data[0];\n    let cmd = e.data[1];\n    let args = e.data.slice(2);\n    let result;\n    if (cmds.hasOwnProperty(cmd)) {\n        result = cmds[cmd].apply(null, args);\n    }\n    else {\n        result = [null, 'unknown command \"' + cmd + '\"'];\n    }\n    if (!Array.isArray(result))\n        result = [null, 'no result for [' + e.data.join(', ') + ']'];\n    let msg = [id, result];\n    self.postMessage(msg);\n}\nlet desiredSeries = null;\nfunction initCmds(main) {\n    'use strict';\n    return {\n        'reset': function () {\n            main.reset();\n            return ['ok', null];\n        },\n        'set_val': function (name, val) {\n            main.setValue(name, val);\n            return ['ok', null];\n        },\n        'get_val': function (...args) {\n            let result = {};\n            for (let i = 0; i < args.length; i++)\n                result[args[i]] = main.value(args[i]);\n            return [result, null];\n        },\n        'get_series': function (...args) {\n            let result = {};\n            for (let i = 0; i < args.length; i++) {\n                let series = main.series(args[i]);\n                if (series !== null)\n                    result[args[i]] = series;\n            }\n            return [result, null];\n        },\n        'dominance': function (overrides, indicators) {\n            return [main.dominance(overrides, indicators), null];\n        },\n        'run_to': function (time) {\n            main.runTo(time);\n            return [main.value('time'), null];\n        },\n        'run_to_end': function () {\n            let result = {};\n            main.runToEnd();\n            if (desiredSeries !== null) {\n                for (let i = 0; i < desiredSeries.length; i++) {\n                    let series = main.series(desiredSeries[i]);\n                    if (series !== null)\n                        result[desiredSeries[i]] = series;\n                }\n                return [result, null];\n            }\n            else {\n                return [main.value('time'), null];\n            }\n        },\n        'var_names': function (includeHidden) {\n            return [main.varNames(includeHidden), null];\n        },\n        'set_desired_series': function (names) {\n            desiredSeries = names;\n            return ['ok', null];\n        },\n    };\n}\nfunction lookup(table, index) {\n    'use strict';\n    const size = table.x.length;\n    if (size === 0)\n        return NaN;\n    const x = table.x;\n    const y = table.y;\n    if (index <= x[0]) {\n        return y[0];\n    }\n    else if (index >= x[size - 1]) {\n        return y[size - 1];\n    }\n    let low = 0;\n    let high = size;\n    let mid;\n    while (low < high) {\n        mid = Math.floor(low + (high - low) / 2);\n        if (x[mid] < index) {\n            low = mid + 1;\n        }\n        else {\n            high = mid;\n        }\n    }\n    let i = low;\n    if (x[i] === index) {\n        return y[i];\n    }\n    else {\n        const slope = (y[i] - y[i - 1]) / (x[i] - x[i - 1]);\n        return (index - x[i - 1]) * slope + y[i - 1];\n    }\n}\nfunction abs(a) {\n    a = +a;\n    return Math.abs(a);\n}\nfunction arccos(a) {\n    a = +a;\n    return Math.acos(a);\n}\nfunction arcsin(a) {\n    a = +a;\n    return Math.asin(a);\n}\nfunction arctan(a) {\n    a = +a;\n    return Math.atan(a);\n}\nfunction cos(a) {\n    a = +a;\n    return Math.cos(a);\n}\nfunction exp(a) {\n    a = +a;\n    return Math.exp(a);\n}\nfunction inf() {\n    return Infinity;\n}\nfunction int(a) {\n    a = +a;\n    return a | 0;\n}\nfunction ln(a) {\n    a = +a;\n    return Math.log(a);\n}\nfunction log10(a) {\n    a = +a;\n    return Math.log10(a);\n}\nfunction max(a, b) {\n    a = +a;\n    b = +b;\n    return a > b ? a : b;\n}\nfunction min(a, b) {\n    a = +a;\n    b = +b;\n    return a < b ? a : b;\n}\nfunction pi() {\n    return Math.PI;\n}\nfunction pulse(dt, time, volume, firstPulse, interval) {\n    if (time < firstPulse)\n        return 0;\n    let nextPulse = firstPulse;\n    while (time >= nextPulse) {\n        if (time < nextPulse + dt) {\n            return volume / dt;\n        }\n        else if (interval <= 0.0) {\n            break;\n        }\n        else {\n            nextPulse += interval;\n        }\n    }\n    return 0;\n}\nfunction safediv(a, b, alternative) {\n    a = +a;\n    b = +b;\n    if (b !== 0) {\n        return a / b;\n    }\n    return alternative ? alternative : 0;\n}\nfunction sin(a) {\n    a = +a;\n    return Math.sin(a);\n}\nfunction sqrt(a) {\n    a = +a;\n    return Math.sqrt(a);\n}\nfunction tan(a) {\n    a = +a;\n    return Math.tan(a);\n}";

export const epilogue =
  "\"use strict\";\nlet pr;\nif (typeof console === 'undefined') {\n    pr = print;\n}\nelse {\n    pr = console.log;\n}\nmain.runToEnd();\nlet series = {};\nlet header = 'time\\t';\nlet vars = main.varNames(false);\nfor (let i = 0; i < vars.length; i++) {\n    let v = vars[i];\n    if (v === 'time')\n        continue;\n    header += v + '\\t';\n    let s = main.series(v);\n    if (s !== null)\n        series[v] = s;\n}\npr(header.substr(0, header.length - 1));\nlet nSteps = 0;\nlet timeSeries = main.series('time');\nif (timeSeries !== null)\n    nSteps = timeSeries.time.length;\nfor (let i = 0; i < nSteps; i++) {\n    let msg = '';\n    for (let v in series) {\n        if (!series.hasOwnProperty(v))\n            continue;\n        if (msg === '')\n            msg += series[v].time[i] + '\\t';\n        msg += series[v].values[i] + '\\t';\n    }\n    pr(msg.substr(0, msg.length - 1));\n}";

export const drawCSS =
  '<defs><style>\n/* <![CDATA[ */\n.spark-axis {\n    stroke-width: 0.125;\n    stroke-linecap: round;\n    stroke: #999;\n    fill: none;\n}\n\n.spark-line {\n    stroke-width: 0.5;\n    stroke-linecap: round;\n    stroke: #2299dd;\n    fill: none;\n}\n\ntext {\n    font-size: 12px;\n    font-family: "Roboto", "Open Sans", Arial, sans-serif;\n    font-weight: 300;\n    text-anchor: middle;\n    white-space: nowrap;\n    vertical-align: middle;\n}\n\n.left-aligned {\n    text-anchor: start;\n}\n\n.right-aligned {\n    text-anchor: end;\n}\n/* ]]> */\n</style></defs>\n';
