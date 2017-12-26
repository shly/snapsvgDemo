<template>
	<div class="container">
    <button class="show" @click="test">添加</button>
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
      data: {
        name: '根节点',
        id: '1',
        children: [
          {
            name: '子节点1',
            id: '1-1'
          }
        ]
      }
    }
  },
  methods: {
    /** @description 将每一个节点封装成SVG中的节点，带有左上角坐标
     *  @augments value 节点文本内容
     *  @augments x 节点左上角x坐标
     *  @augments y 节点左上角y坐标
     *  @returns 返回节点对象，包括节点内容，节点左上角坐标和节点的宽度和高度
    */
    Node (value, x, y) {
      let obj = {}
      let width = value.length * this.fontSize + 20
      let height = this.fontSize + 10
      obj.value = value
      obj.x = x
      obj.y = y
      obj.width = width
      obj.height = height
      return obj
    },
    /** @description 画一个文本框
     *  @augments node 文本节点
     *  @returns 返回文本和框线的组合对象
     */
    drawNode (node) {
      let rect = this.svgInstance.rect(node.x, node.y, node.width, node.height, 5)
      rect.attr({
        fill: '#bada55',
        stroke: '#000',
        strokeWidth: 1
      })
      let text = this.svgInstance.text(node.x + 10, node.y + this.fontSize + 2, node.value).attr({
        fontSize: this.fontSize
      })
      let g = this.svgInstance.g()
      g.add(rect, text)
      return node
    },
    /** @description 画两个节点之间的线
     *  @augments from 开始节点
     *  @augments to 截止节点
     */
    drawLine (fromNode, toNode) {
      let path1 = `M${fromNode.x + fromNode.width} ${fromNode.y + fromNode.height / 2}L${toNode.x} ${toNode.y + fromNode.height / 2}`
      let line = this.svgInstance.path(path1)
      line.attr({
        stroke: '#000',
        strokeWidth: 1
      })
    },
    /** @description 将数据封装成节点对象 */
    // createNodes (data) {
    //   let root = this.Node(data.name, 100, 100)
    //   this.createNode(root)
    //   if (data.children && data.children.length > 0) {
    //     let len = data.children.length
    //     if (len === 1) {
    //       let node = this.Node(data.name, root.x + this.horizonSpace, root.y)
    //     } else {

    //     }
    //   }
    // },
    /** @description 画图
     */
    test () {
      this.svgInstance = Snap('#svg')
      let root = this.Node('根节点', 100, 100)
      let test1 = this.Node('子节点1', 200, 100)
      let test2 = this.Node('子节点2', 200, 200)
      let test3 = this.Node('子节点3', 200, 300)
      this.drawNode(root)
      this.drawNode(test1)
      this.drawNode(test2)
      this.drawNode(test3)
      this.drawLine(root, test1)
      this.drawLine(root, test2)
      this.drawLine(root, test3)
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
</style>