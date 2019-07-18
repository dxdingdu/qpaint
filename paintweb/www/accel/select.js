class QShapeSelector {
    constructor() {
        this.selection = null
        this.started = false
        this.pt = {x: 0, y: 0}
        this.ptMove = {x: 0, y: 0}
        let ctrl = this
        qview.onmousedown = function(event) { ctrl.onmousedown(event) }
        qview.onmousemove = function(event) { ctrl.onmousemove(event) }
        qview.onmouseup = function(event) { ctrl.onmouseup(event) }
        qview.onkeydown = function(event) { ctrl.onkeydown(event) }
        qview.onPropChanged = function(propKey) { ctrl.onPropChanged(propKey) }
    }
    stop() {
        qview.onmousedown = null
        qview.onmousemove = null
        qview.onmouseup = null
        qview.onkeydown = null
        qview.onPropChanged = null
        qview.drawing.style.cursor = "auto"
    }

    reset() {
        this.started = false
    }

    onmousedown(event) {
        this.pt = this.ptMove = qview.getMousePos(event)
        this.started = true
        let ht = qview.doc.hitTest(this.pt)
        if (this.selection != ht.hitShape) {
            this.selection = ht.hitShape
            invalidate(null)
        }
    }
    onmousemove(event) {
        let pt = qview.getMousePos(event)
        if (this.started) {
            this.ptMove = pt
            invalidate(null)
        } else {
            let ht = qview.doc.hitTest(pt)
            if (ht.hitCode > 0) {
                qview.drawing.style.cursor = "move"
            } else {
                qview.drawing.style.cursor = "auto"
            }
        }
    }
    onmouseup(event) {
        if (this.started) {
            if (this.selection != null) {
                let pt = qview.getMousePos(event)
                this.selection.move(pt.x - this.pt.x, pt.y - this.pt.y)
            }
            this.reset()
            invalidate(null)
        }
    }
    onkeydown(event) {
        if (event.keyCode == 27) { // keyEsc
            this.reset()
        }
    }
    onPropChanged(propKey) {
        if (this.selection != null) {
            this.selection.setProp(propKey, qview.style[propKey])
            invalidate(null)
        }
    }

    onpaint(ctx) {
        if (this.selection != null) {
            let bound = this.selection.bound()
            if (this.started) {
                bound.x += this.ptMove.x - this.pt.x
                bound.y += this.ptMove.y - this.pt.y
            }
            ctx.lineWidth = 1
            ctx.strokeStyle = "gray"
            ctx.beginPath()
            ctx.setLineDash([5, 5])
            ctx.rect(bound.x, bound.y, bound.width, bound.height)
            ctx.stroke()
            ctx.setLineDash([])
        }
    }
}

qview.registerController("ShapeSelector", function() {
    return new QShapeSelector()
})