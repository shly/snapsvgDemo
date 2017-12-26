<template>
	<div class="container">
    <button class="show" @click="addNode">添加</button>
		<svg id="svg" class="demo"></svg>
	</div>
</template>
<script>
import Snap from 'snapsvg'
export default {
  data () {
    return {
      svgInstance: {},
      fontSize: 16,
      horizonSpace: 40,
      verticalSpace: 20,
      rootPosition: {
        x: 100,
        y: 100
      },
      selectedNode: {},
      data: [
        {
          name: '根节点',
          id: '1',
          children: [
            {
              name: '子节点1',
              id: '1-1',
              children: [
                {
                  name: 'safasfdasf',
                  id: '1-2'
                },
                {
                  name: 'safasfdasf',
                  id: '1-2'
                },
                {
                  name: 'safasfdasf',
                  id: '1-2'
                }
              ]
            },
            {
              name: '子节点1',
              id: '1-1',
              children: [
                {
                  name: 'safasfdasf',
                  id: '1-2'
                }
              ]
            }
          ]
        }
      ]
    }
  },
  methods: {
    /** @description 将每一个节点封装成SVG中的节点，带有左上角坐标
     *  @augments value 节点文本内容
     *  @augments id 节点id
     *  @augments x 节点左上角x坐标
     *  @augments y 节点左上角y坐标
     *  @returns 返回节点对象，包括节点内容，节点左上角坐标和节点的宽度和高度
    */
    Node (value, id, x, y) {
      let obj = {}
      let width = value.length * this.fontSize + 20
      let height = this.fontSize + 10
      obj.value = value
      obj.id = id
      obj.x = x
      obj.y = y
      obj.width = width
      obj.height = height
      obj.children = []
      return obj
    },
    /** @description 画一个文本框
     *  @augments node 文本节点
     *  @returns 返回文本和框线的组合对象
     */
    drawNode (node) {
      let _this = this
      let rect = this.svgInstance.rect(node.x, node.y, node.width, node.height, 5)
      rect.attr({
        fill: '#fff',
        stroke: '#000',
        strokeWidth: 1
      })
      let text = this.svgInstance.text(node.x + 10, node.y + this.fontSize + 2, node.value).attr({
        fontSize: this.fontSize
      })
      let g = this.svgInstance.g()
      g.add(rect, text)
      g.addClass('node ' + node.id)
      g.click(function (e) {
        Snap.selectAll('.node').forEach(function (item) {
          item.children()[0].attr({
            fill: '#fff',
            stroke: '#000',
            strokeWidth: 1
          })
        })
        rect.attr({
          fill: '#bada55',
          stroke: '#000',
          strokeWidth: 1
        })
        _this.selectedNode = node
        console.log(_this.selectedNode)
      })
      g.mousedown(function (e) {
        if (e.button === 2) {
          alert(node.value)
        }
      })
      return node
    },
    /** @description 画两个节点之间的线
     *  @augments from 开始节点
     *  @augments to 截止节点
     */
    drawLine (fromNode, toNode) {
      let path = `M${fromNode.x + fromNode.width} ${fromNode.y + fromNode.height / 2}L${toNode.x} ${toNode.y + fromNode.height / 2}`
      let line = this.svgInstance.path(path)
      line.attr({
        stroke: '#000',
        strokeWidth: 1
      })
    },
    /** @description 将数据封装成节点对象
     *  @augments data 要展示的流程数据
     *  @augments parentNode 父节点
     */
    transformData (data, parentNode) {
      let _this = this
      let root = null
      if (parentNode === null) {
        root = this.Node(data[0].name, data[0].id, this.rootPosition.x, this.rootPosition.x)
        data = data[0].children
        this.transformData(data, root)
      } else {
        root = parentNode
        let childNodesX = root.x + root.width + this.horizonSpace
        let len = data.length
        let baseY = (2 * root.y - (len - 1) * (root.height + this.verticalSpace)) / 2
        data.forEach(function (item, i) {
          let node = _this.Node(item.name, item.id, childNodesX, baseY + i * (root.height + _this.verticalSpace))
          root.children.push(node)
          if (item.children && item.children.length > 0) {
            _this.transformData(item.children, node)
          }
        })
      }
      return root
    },
    /** @description 画树 */
    drawFlowChart (root) {
      let _this = this
      this.drawNode(root)
      if (root.children && root.children.length > 0) {
        root.children.forEach(function (item) {
          _this.drawLine(root, item)
          _this.drawFlowChart(item)
        })
      }
    },
    /** @description init
     */
    test () {
      this.svgInstance = Snap('#svg')
      let root = this.transformData(this.data, null)
      this.drawFlowChart(root)
    },
    /** @description 添加子节点 */
    addNode () {

    }
  },
  mounted () {
    this.test()
  }
}
</script>
<style>
	.demo {
		width:800px;
		height:500px;
    border: 1px solid #ccc;
	}
  .node{
    cursor: pointer;
  }
</style>