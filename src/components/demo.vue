<template>
	<div class="container">
    <button class="show" @click="showtopo">添加</button>
		<svg id="svg" class="demo"></svg>
	</div>
</template>
<script>
import Snap from 'snapsvg'
export default {
  data () {
    return {
      svgInstance: {},
      data: [
        {
          name: '根节点',
          id: '1',
          children: [
            {
              name: '子节点1',
              id: '1-1'
            }
          ]
        }
      ]
    }
  },
  methods: {
    /** @description 画一个文本框
     *  @augments rectX 节点左上角x坐标
     *  @augments rectY 节点左上角y坐标
     *  @augments rectWidth 节点宽度
     *  @augments rectHeight 节点高度
     *  @augments text 文本框的内容
     */
    createNode (rectX = 0, rectY = 0, rectWidth = 0, rectHeight = 0, text = '') {
      let x = rectX
      let y = rectY
      let width = rectWidth
      let height = rectHeight
      let rect = this.svgInstance.rect(x, y, width, height, 5)
      rect.attr({
        fill: '#bada55',
        stroke: '#000',
        strokeWidth: 1
      })
      let textX = x + 10
      let textY = y + 20
      this.svgInstance.text(textX, textY, text)
    },
    /** @description 画两个节点之间的线
     *  @augments from 开始节点
     *  @augments to 截止节点
     */
    drawLine (from, to) {

    },
    /** @description 画图
     */
    showtopo () {
      this.svgInstance = Snap('#svg')
      this.createNode(50, 200, 100, 40, '根节点')
    }
  },
  mounted () {
    this.showtopo()
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