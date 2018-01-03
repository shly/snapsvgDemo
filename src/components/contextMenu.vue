<template>
  <div class="contextMenu-Container" @click.stop="stopBubble">
    <ul>
      <li v-for="item in items" :key="item.value" @click="chooseItem(item.value)">{{ item.name }}</li>
    </ul>
  </div>
</template>
<script>
 export default {
   name: 'contextMenu',
   props: {
     'items': Array,
     'position': {}
   },
   data () {
     return {
     }
   },
   methods: {
     chooseItem (val) {
       this.$emit('chooseItem', val)
     },
     stopBubble () {
       return false
     }
   }
 }
</script>
<style scoped lang='less'>
.contextMenu-Container {
  position: absolute;
  background: #eff3f5;
  font-size: 12px;
  box-shadow: 1px 1px 5px #ccc;
  padding: 15px 0;
  ul, li {
    list-style: none;
    margin: 0;
    padding: 0;
    color: #3d5564;
  }
  li {
    line-height: 35px;
    padding: 0 20px;
    &:hover {
      cursor: pointer;
      background: #2199de;
      color: #ffffff;
    }
  }
}
</style>
