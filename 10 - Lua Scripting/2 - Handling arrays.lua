local colors = {'red', ' green', 'blue'}

-- In Lua indexing generally starts at index 1
print(colors[1])

-- Size of the array
print(#colors)

table.insert(colors, 'orange')
print(colors[4])

for i, v in ipairs(colors) do
    print(i, v)
end
