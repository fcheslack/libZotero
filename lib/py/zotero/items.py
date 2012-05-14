import logging
from item import *


class Items(object):
    def __init__(self):
        self.itemObjects = {}

    def getItem(self, itemKey):
        if itemKey in self.itemObjects:
            return self.itemObjects[itemKey]

    def addItem(self, item):
        itemKey = item.itemKey
        self.itemObjects[itemKey] = item
        return item

    def addItemsFromFeed(self, feed):
        addedItems = []
        for entry in feed.entries:
            item = Item(entry)
            self.addItem(item)
            addedItems.append(item)
        return addedItems

    def replaceItem(self, item):
        itemKey = item.itemKey
        self.itemObjects[itemKey] = item
