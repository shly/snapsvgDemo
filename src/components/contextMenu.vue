<template>
  <div class="contextMenu-Container">
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
     }
   }
 }
</script>
<style scoped lang='less'>
.contextMenu-Container {
  position: absolute;
  border: 1px solid;
  font-size: 14px;
  ul, li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li {
    line-height: 20px;
    padding: 0 10px;
    &:hover {
      cursor: pointer;
      background: #ccc;
    }
  }
}
</style>
